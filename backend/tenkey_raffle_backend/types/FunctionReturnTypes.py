from enum import Enum


class AttendanceModificationStatus(Enum):
    PROCESSED_SUCCESSFULLY = 0  # 問題なく処理された
    ALREADY_PROCESSED = 1      # 既に指定の設定に設定済み、処理する必要なし
    NONEXISTENT_ID = 2         # 指定された参加者IDが存在しない
