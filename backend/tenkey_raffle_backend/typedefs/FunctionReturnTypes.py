from enum import Enum


class AttendanceModificationStatus(Enum):
    PROCESSED_SUCCESSFULLY = 0  # 問題なく処理された
    ALREADY_PROCESSED = 1      # 既に指定の設定に設定済み、処理する必要なし
    NONEXISTENT_ID = 2         # 指定された参加者IDが存在しない

class RaffleModificationStatus(Enum):
    PROCESSED_SUCCESSFULLY = 0     # 問題なく処理された
    NONEXISTENT_PRIZE_ID = 1       # 存在しない景品を指定された
    NONEXISTENT_PARTICIPANT_ID = 2 # 存在しない参加者を指定された
    NOT_OVERWRITING = 3            # 既に当選記録が存在するので上書きしなかった
    PRIZE_NOT_RAFFLED = 4          # 指定された景品は抽選されてない
    