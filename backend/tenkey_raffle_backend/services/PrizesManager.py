
from os import path
import csv

from util.SingletonMetaclass import Singleton
from types.RaffleDatatypes import Prize
from services.CsvParser import parse_prizes_csv


# Singletonなので、インスタンスは1つしか作成されない
class PrizesManager(metaclass=Singleton):

    def __init__(self):
        """
        作成時に既存ファイルを読み込む
        """
        
        # 景品リスト
        self.prizes: list[Prize] = []
        
        # 景品リスト読み込み
        if not path.exists('./prizes.csv'):
            print('既存のprizes.csvはありません')
        else:
            print('既存のprizes.csvを利用します')
            prizes_file = open('./prizes.csv', 'rt', newline='')
            prizes_reader = csv.DictReader(prizes_file)
            prizes_return = parse_prizes_csv(prizes_reader)
            if prizes_return['error']:
                print(prizes_return['error'])
                exit(1)
            self.prizes = prizes_return['prizes']
            prizes_file.close()
        
        # 読み込み完了
        return
    
    # === ファイル管理関数 ===
    def __write_prizes(self) -> None:
        """
        ローカル保管の景品CSVを書き出す
        self.prizesを変更後に必ず行うべき
        """
        prizes_file = open('./prizes.csv', 'wt', newline='')
        writer = csv.DictWriter(prizes_file, fieldnames=['管理No', '提供元', '景品名'])
        writer.writeheader()
        for prize in self.prizes:
            writer.writerow(prize.id, prize.provider, prize.display_name)
        prizes_file.close()
    
    
    # === 景品情報取得 ===
        
    def get_all_prizes(self) -> list[Prize]:
        """
        全景品リストを取得
        """
        return self.prizes
    
    def get_prize_by_id(self, id: str) -> Prize | None:
        """
        景品をIDで取得  
        存在しない場合はNoneを返す
        """
        return next(
            (prize for prize in self.prizes if prize.id == id),
            None
        )
        
    def get_prize_group(self, prize_id: str) -> list[str] | None:
        """
        景品グループ（同一の表示名と提供元の景品）が存在する場合はグループ景品のIDリストを取得する  
        グループが存在しない場合（又は景品自体が存在しない場合）はNoneを返す  
        """
        lookup_prize = self.get_prize_by_id(prize_id)
        if not lookup_prize:
            return None
        related_prizes = [prize for prize in self.prizes if (prize.display_name == lookup_prize.display_name and prize.provider == lookup_prize.provider)]
        if len(related_prizes) > 0:
            return related_prizes
        else:
            return None
    
    # === 景品情報編集 ===
    
    def import_new_prizes_list(self, new_prizes: list[Prize]) -> bool:
        """
        新たな景品リストを読み込み・置き換え
        """
        # もし抽選結果が存在する場合、景品リストの置き換えを許さない
        if len(self.winner_mappings) > 0:
            return False
        self.prizes = new_prizes
        self.__write_prizes()
        return True
    
    def wipe_prizes_list(self, new_prizes: list[Prize]) -> bool:
        """
        景品リストの削除
        """
        # もし抽選結果が存在する場合、景品リストの置き換えを許さない
        if len(self.winner_mappings) > 0:
            return False
        self.prizes = []
        self.__write_prizes()
        return True
    