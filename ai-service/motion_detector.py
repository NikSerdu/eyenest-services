from __future__ import annotations

from dataclasses import dataclass
from time import monotonic

import cv2
import numpy as np


@dataclass(frozen=True)
class MotionEvent:
    contour_area: float
    changed_pixels: int


class MotionDetector:
    def __init__(
        self,
        *,
        min_area: int,
        frame_cooldown_sec: float,
        blur_size: int,
    ) -> None:
        self._min_area = min_area
        self._frame_cooldown_sec = frame_cooldown_sec
        self._blur_size = blur_size
        self._previous_frame: np.ndarray | None = None
        self._last_event_at = 0.0

    def detect(self, frame_bgr: np.ndarray) -> MotionEvent | None:
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(
            gray,
            (self._blur_size, self._blur_size),
            0,
        )

        if self._previous_frame is None:
            self._previous_frame = blurred
            return None

        # Live video tracks may change resolution at runtime.
        # When that happens we reset the baseline frame instead of comparing
        # arrays with different shapes and crashing inside OpenCV.
        if self._previous_frame.shape != blurred.shape:
            self._previous_frame = blurred
            return None

        frame_delta = cv2.absdiff(self._previous_frame, blurred)
        threshold = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        dilated = cv2.dilate(threshold, None, iterations=2)
        contours, _ = cv2.findContours(
            dilated,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE,
        )

        self._previous_frame = blurred

        if not contours:
            return None

        largest_contour_area = max(cv2.contourArea(contour) for contour in contours)
        if largest_contour_area < self._min_area:
            return None

        now = monotonic()
        if now - self._last_event_at < self._frame_cooldown_sec:
            return None

        self._last_event_at = now
        return MotionEvent(
            contour_area=largest_contour_area,
            changed_pixels=int(np.count_nonzero(dilated)),
        )
