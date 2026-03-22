import { EgressEntity, IEgressRepository } from '@/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EgressRepository implements IEgressRepository {
  constructor(private readonly prisma: PrismaService) {}
  async addEgress(data: Omit<EgressEntity, 'id'>) {
    return await this.prisma.egress.create({
      data,
    });
  }
  async getEgress(roomId: string) {
    return await this.prisma.egress.findFirst({
      where: {
        roomId,
      },
    });
  }
  async deleteEgress(roomId: string) {
    return await this.prisma.egress.delete({
      where: {
        roomId,
      },
    });
  }
}
