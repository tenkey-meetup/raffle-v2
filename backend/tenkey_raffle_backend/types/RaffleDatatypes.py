from typing import NamedTuple

class Participant(NamedTuple):
    registration_id: str     # バーコードに利用される数字ID（CSVの「受付番号」）
    username: str            # Connpassのアカウント名（CSVの「ユーザー名」）
    display_name: str        # 表示名（CSVの「表示名」）
    connpass_attending: bool # Connpass上参加しているか（CSVの「参加ステータス」が「参加」ならTrue、「参加キャンセル」ならFalse）
    
class Prize(NamedTuple):
    provider: str     # 提供者名
    display_name: str # 表示名
    id: str           # 管理用ID

class WinnerMapping(NamedTuple):
    participant_id: str  # 当選者の受付番号
    prize_id: str        # 景品のID