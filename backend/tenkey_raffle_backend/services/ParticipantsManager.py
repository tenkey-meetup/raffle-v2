
from os import path
import csv

from typedefs.FunctionReturnTypes import AttendanceModificationStatus
from util.SingletonMetaclass import Singleton
from typedefs.RaffleDatatypes import Participant
from services.CsvParser import parse_participants_csv


# Singletonなので、インスタンスは1つしか作成されない
class ParticipantsManager(metaclass=Singleton):

    def __init__(self):
        """
        作成時に既存ファイルを読み込む
        """
        
        # 全参加者リスト（不参加含む）
        self.all_participants: list[Participant] = []
        
        # 当日不参加の受付番号リスト
        self.cancels: list[str] = [] 
        
        # 会場に居る全参加者リスト（participants - Connpass不参加 - 当日不参加）
        # self.__update_attending_participants()で更新
        self.attending_participants: list[Participant] = []
        
        
        # 参加者リスト読み込み
        if not path.exists('./parts.csv'):
            print('既存のparts.csvはありません')
        else:
            print('既存のparts.csvを利用します')
            participants_file = open('./parts.csv', 'rt', newline='')
            participants_reader = csv.DictReader(participants_file)
            participants_return = parse_participants_csv(participants_reader)
            if participants_return['error']:
                print(participants_return['error'])
                exit(1)
            self.all_participants = participants_return['participants']
            participants_file.close()
        
        # 不参加リスト
        if not path.exists('./cancels.txt'):
            print('既存のcancels.txtはありません')
        else:
            print('既存のcancels.txtを利用します')
            cancels_file = open('./cancels.txt', 'rt')
            for line_num, line in enumerate(cancels_file):
                # キャンセルリストの読み込み
                # 空欄はスキップ
                if line == "" or line.isspace():
                    continue
                # 数字列の場合は受付番号として登録
                elif line.isdigit():
                    self.cancels.append(line)
                # その他は弾く
                else:
                    print(f'cancels.txtに受付番号ではない行があります（"{line}"、{line_num}行目）')
                    exit(1)
        
        # 読み込み完了
        # self.attending_participantsを更新
        self.__update_attending_participants()
        
        # Done
        return
    
    
    # === データ・ファイル管理関数 ===
    
    def __update_attending_participants(self) -> None:
        """
        会場に居る参加者リスト（self.attending_participants）を更新  
        参加者リスト又は不参加リストが更新された際は必ず呼ぶべき
        """
        self.attending_participants = [participant for participant in self.all_participants 
                if participant.connpass_attending and
                   participant.registration_id not in self.cancels
                ]
        
    def __write_participants(self) -> None:
        """
        ローカル保管の参加者CSVを書き出す
        self.all_participantsを変更後に必ず行うべき
        """
        participants_file = open('./parts.csv', 'wt', newline='')
        writer = csv.DictWriter(participants_file, fieldnames=['ユーザー名', '表示名', '参加ステータス', '受付番号'])
        writer.writeheader()
        for participant in self.all_participants:
            writer.writerow(participant.username, participant.display_name, participant.connpass_attending, participant.registration_id)
        participants_file.close()
        
    
    def __write_cancels(self) -> None:
        """
        当日不参加リストを書き出す
        self.cancelsを変更後に必ず行うべき
        """
        cancels_file = open('./cancels.txt', 'wt')
        for entry in self.cancels:
            cancels_file.write(f"{entry}\n")
        cancels_file.close()
    
    
    # === 参加者情報取得 ===
    
    def is_attending(self, id: str) -> bool:
        """
        参加者が会場にいるかを確認  
        （Connpassでキャンセルされてない＋当日不参加リストに含まれてない）
        """
        # 当日参加リスト（self.attending_participants）に入ってるかチェック
        return any(participant.registration_id == id for participant in self.attending_participants)
    
    def get_all_participants(self) -> list[Participant]:
        """
        参加者リストを取得（不参加を含む）
        """
        return self.all_participants
    
    def get_all_participant_ids(self) -> list[str]:
        """
        全参加者のIDだけを取得
        """
        return [participant.registration_id for participant in self.all_participants]
    
    def get_available_participants(self) -> list[Participant]:
        """
        会場に居る参加者リストを取得（Connpass不参加、当日不参加を省く）
        """
        return self.attending_participants
    
    def get_available_participant_ids(self) -> list[str]:
        """
        会場にいる参加者のIDリストを取得（Connpass不参加、当日不参加を省く）
        """
        return [participant.registration_id for participant in self.attending_participants]
    
    def get_participant_by_id(self, id: str) -> Participant | None:
        """
        参加者をIDから取得（存在しない場合はNone）
        """
        return next(
            (participant for participant in self.all_participants if participant.registration_id == id),
            None
        )
    
    
    # === 参加者情報編集 ===
    
    def import_new_participants_list(self, new_participants: list[Participant]) -> bool:
        """
        新たな参加者リストを読み込み・置き換え
        """
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(self.winner_mappings) > 0:
            return False
        self.all_participants = new_participants
        self.__write_participants()
        self.__update_attending_participants()
        return True
    
    def wipe_participants_list(self) -> bool:
        """
        参加者リストの削除
        """
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(self.winner_mappings) > 0:
            return False
        self.all_participants = []
        self.__write_participants()
        self.__update_attending_participants()
        return True
        
        
    # === キャンセル（当日不参加）管理 ===
    
    def get_all_cancel_ids(self) -> list[str]:
        """
        全ての当日不参加者のIDを取得
        """
        return self.cancels
    
    def add_cancel(self, id: str) -> AttendanceModificationStatus:
        """
        当日不参加リストにIDを追加する
        """
        
        if not self.get_participant_by_id(id):
            return AttendanceModificationStatus.NONEXISTENT_ID
        if id in self.cancels:
            return AttendanceModificationStatus.ALREADY_PROCESSED
        else:
            self.cancels.append(id)
            self.__write_cancels()
            self.__update_attending_participants()
            return AttendanceModificationStatus.PROCESSED_SUCCESSFULLY
        
    def remove_cancel(self, id: str) -> AttendanceModificationStatus:
        """
        当日不参加リストからIDを削除する
        """
        
        if not self.get_participant_by_id(id):
            return AttendanceModificationStatus.NONEXISTENT_ID
        if id not in self.cancels:
            return AttendanceModificationStatus.ALREADY_PROCESSED
        else:
            self.cancels.remove(id)
            self.__write_cancels()
            self.__update_attending_participants()
            return AttendanceModificationStatus.PROCESSED_SUCCESSFULLY
        
    def wipe_cancels(self) -> None:
        """
        当日不参加IDリストをリセット
        """
        self.cancels = []
        self.__write_cancels()
        self.__update_attending_participants()
        return
    