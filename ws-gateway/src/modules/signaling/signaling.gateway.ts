import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EVENTS } from './types/events';

@WebSocketGateway()
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger();
  private readonly cameraSockets = new Map<string, string>(); //<roomID,socketID - айди сокета камеры>
  // Server instance for broadcasting to all clients
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    this.logger.log('WS started: ws://localhost:3000');
  }

  // Called automatically when a client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Called automatically when a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(EVENTS.JOIN)
  join(
    @MessageBody() data: { roomID: string; isCamera: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(socket.id);

    const { isCamera, roomID } = data;
    const { rooms: joinedRooms } = socket;
    if (joinedRooms.has(roomID)) {
      return console.warn('Вы уже подключены в эту комнату');
    }

    const clients = Array.from(
      this.server.sockets.adapter.rooms.get(roomID) || [],
    );

    if (isCamera) {
      console.log(clients);

      //если подключилась камера, то все должны добавить cameraPeer и создать офферы для неё через RELAY_SDP
      clients.forEach((clientID) => {
        this.server.to(clientID).emit(EVENTS.SHARE_CAMERA_PEER_ID, {
          peerID: socket.id,
          roomID,
        });
        socket.emit(EVENTS.ADD_VIEWER_PEER, { peerID: clientID });
      });
      this.cameraSockets.set(roomID, socket.id);
    } else {
      //если подключилась не камера, то камера должна добавить viewerPeer и потом дать answer каждому viewer
      const cameraSocketId = this.cameraSockets.get(roomID);
      if (!cameraSocketId) {
        return console.warn('Камера не подключена');
      }
      this.server.to(cameraSocketId).emit(EVENTS.ADD_VIEWER_PEER, {
        peerID: socket.id,
      });
      socket.emit(EVENTS.SHARE_CAMERA_PEER_ID, {
        peerID: cameraSocketId,
        roomID,
      });
    }

    socket.join(roomID);
  }

  @SubscribeMessage(EVENTS.RELAY_SDP)
  relaySDP(
    @MessageBody() data: { peerID: string; sessionDescription: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { peerID, sessionDescription } = data;
    this.server.to(peerID).emit(EVENTS.RELAY_SDP, {
      peerID: socket.id, //от кого пришло
      sessionDescription, //offer/answer
    });
  }

  @SubscribeMessage(EVENTS.RELAY_ICE)
  relayICE(
    @MessageBody() data: { peerID: string; iceCandidate: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { peerID, iceCandidate } = data;
    this.server.to(peerID).emit(EVENTS.RELAY_ICE, {
      peerID: socket.id, //от кого пришло
      iceCandidate,
    });
  }

  @SubscribeMessage(EVENTS.LEAVE)
  leave(
    @MessageBody() data: { roomID: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomID } = data;

    const isCamera = this.cameraSockets.get(roomID) === socket.id;
    socket.leave(roomID);
    if (isCamera) {
      this.cameraSockets.delete(roomID);
      const clients = Array.from(
        this.server.sockets.adapter.rooms.get(roomID) || [],
      );
      clients.forEach((clientID) => {
        this.server.to(clientID).emit(EVENTS.CAMERA_OFFLINE);
      });
    } else {
      const cameraId = this.cameraSockets.get(roomID);
      if (cameraId) {
        this.server.to(cameraId).emit(EVENTS.DELETE_VIEWER, {
          peerID: socket.id,
        });
      }
    }
  }
}
