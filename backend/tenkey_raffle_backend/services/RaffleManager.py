
from os import path
import csv

from settings import WINNERS_CSV_FILEPATH
from typedefs.FunctionReturnTypes import RaffleModificationStatus
from typedefs.RaffleDatatypes import Participant, Prize, WinnerMapping
from services.PrizesManager import PrizesManager
from services.ParticipantsManager import ParticipantsManager
from util.SingletonMetaclass import Singleton
from services.CsvParser import parse_winners_csv


# Singletonなので、インスタンスは1つしか作成されない
class RaffleManager(metaclass=Singleton):

    def __init__(self):
        """
        作成時に既存ファイルを読み込む
        """
        
        # 当選者リスト
        self.winner_mappings: list[WinnerMapping] = []
        
        # （既存の）参加者・景品管理クラスオブジェを呼び出す
        self.participants_manager = ParticipantsManager()
        self.prizes_manager = PrizesManager()
                    
        # 当選リストの読み込み
        if not path.exists(WINNERS_CSV_FILEPATH):
            print('既存のwinners.csvはありません')
        else:
            print('既存のwinners.csvを利用します')
            winners_file = open(WINNERS_CSV_FILEPATH, 'rt', newline='')
            winners_reader = csv.DictReader(winners_file)
            winners_return = parse_winners_csv(winners_reader, self.participants_manager.get_all_participants(), self.prizes_manager.get_all_prizes())
            if winners_return['error']:
                print(winners_return['error'])
                exit(1)
            self.winner_mappings = winners_return['winner_mappings']
            
            winners_file.close()
        
        # 読み込み完了
        return
    
    
    # === ファイル管理関数 ===
    def __write_winners(self) -> None:
        """
        当選者CSVを書き出す
        self.winner_mappingsを変更後に必ず行うべき
        """
        winners_file = open(WINNERS_CSV_FILEPATH, 'wt', newline='')
        writer = csv.DictWriter(winners_file, fieldnames=['景品ID', '当選者受付番号'])
        writer.writeheader()
        for mapping in self.winner_mappings:
            writer.writerow({
                '景品ID': mapping.prize_id, 
                '当選者受付番号': mapping.participant_id
                })
        winners_file.close()
    
    
    # === 抽選状況の管理・編集 ===
    
    def get_prize_winner_mappings(self) -> list[WinnerMapping]:
        """
        現在存在する抽選結果を取得
        """
        return self.winner_mappings
    
    def wipe_prize_winner_mappings(self) -> None:
        """
        抽選結果をリセット
        """
        self.winner_mappings = []
        self.__write_winners()
        return
    
    def get_winner_for_prize(self, prize_id: str) -> str | None:
        """
        景品IDに対して当選者IDを返す
        当選者がいない場合はNoneを返す
        """
        return next((entry.participant_id for entry in self.winner_mappings if entry.prize_id == prize_id), None)
    
    def set_winner_for_prize(self, prize_id: str, winner_id: str, overwrite: bool) -> RaffleModificationStatus:
        """
        景品に対して当選者IDを書き込む  
        成功の場合はTrue、失敗の場合はFalseを返す  
        
        @param overwrite: 景品IDに既存の当選者がいる場合、上書きするかどうか
        """
        
        if prize_id not in self.prizes_manager.get_all_prize_ids():
            return RaffleModificationStatus.NONEXISTENT_PRIZE_ID
        if winner_id not in self.participants_manager.get_all_participant_ids():
            return RaffleModificationStatus.NONEXISTENT_PARTICIPANT_ID
        
        # 景品が既に抽選されているかを確認、Indexを取得
        existing_prize_index = next(
            (index for (index, mapping) in enumerate(self.winner_mappings) if mapping.prize_id == prize_id),
            None
        )
        
        if existing_prize_index != None:
            if overwrite:
                self.winner_mappings[existing_prize_index] = self.winner_mappings[existing_prize_index]._replace(participant_id=winner_id)
            else:
                return RaffleModificationStatus.NOT_OVERWRITING

        else:
            self.winner_mappings.append(WinnerMapping(participant_id=winner_id, prize_id=prize_id))
                
        self.__write_winners()
        return RaffleModificationStatus.PROCESSED_SUCCESSFULLY
    
    def delete_winner_for_prize(self, prize_id: str) -> RaffleModificationStatus:
        """
        抽選済みの景品の当選者を削除する  
        成功した場合はTrue、景品が抽選済みでない場合はFalseを返す
        """
        if prize_id not in self.prizes_manager.get_all_prize_ids():
            return RaffleModificationStatus.NONEXISTENT_PRIZE_ID
        
        # 景品が既に抽選されているかを確認、Indexを取得
        existing_prize_index = next(
            (index for (index, mapping) in enumerate(self.winner_mappings) if mapping.prize_id == prize_id),
            None
        )
        
        if existing_prize_index == None:
            return RaffleModificationStatus.PRIZE_NOT_RAFFLED
        
        del self.winner_mappings[existing_prize_index]
        self.__write_winners()
        return RaffleModificationStatus.PROCESSED_SUCCESSFULLY
        
