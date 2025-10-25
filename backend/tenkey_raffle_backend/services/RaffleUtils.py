

from types.RaffleDatatypes import Participant, Prize
from services.DataHandler import DataHandler
from util.SingletonMetaclass import Singleton


class RaffleUtils(metaclass=Singleton):
    
    def __init__(self):
        self.data_handler = DataHandler()
        return
    
    def get_prizeless_participants(self) -> list[Participant]:
        """ 
        現在当選していない参加者リストを取得（抽選用）  
        TODO: 当選者＜景品数に対応
        """
        return [participant for participant in self.data_handler.get_available_participants()
            if participant.registration_id not in [entry.participant_id for entry in self.data_handler.get_prize_winner_mappings()]]
        
    def get_winnerless_prizes(self) -> list[Prize]:
        """
        現在当選者がいない景品のリストを取得
        """
        return [prize for prize in self.data_handler.get_all_prizes()
                if prize.id not in [entry.prize_id for entry in self.data_handler.get_prize_winner_mappings()]]
        