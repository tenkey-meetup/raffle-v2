import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, request

from services.RaffleManager import RaffleManager
from services.PrizesManager import PrizesManager

api_v1_raffle = Blueprint('api_v1_raffle', __name__)

raffle_manager = RaffleManager()
prizes_manager = PrizesManager()

# 現在の抽選状況を取得
@api_v1_raffle.route("/api/v1/raffle/next", methods=['GET'])
def route_raffle_next():
    if request.method == "GET":
        
        next_prize = raffle_manager.get_next_prize()
        prize_group = None
        
        if next_prize is not None:
            prize_group = prizes_manager.get_prize_group(next_prize.id)
        
        return jsonify({
          # 現在の当選リスト
          "current_mappings": [mapping._asdict() for mapping in raffle_manager.get_prize_winner_mappings()], 
          # 現在当選していない参加者IDリスト（ここから抽選する）
          "participant_pool_ids": raffle_manager.get_participants_pool_ids(), 
          # 次の景品
          "next_prize": next_prize,
          # 次の景品が同一景品グループのうちの1つである場合はグループのIDリスト
          # そうでない場合はNone
          "prize_group_ids": prize_group
        })

