import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, request

from services.CsvParser import parse_prizes_csv
from services.DataHandler import DataHandler

api_v1_raffle = Blueprint('api_v1_raffle', __name__)

data_handler = DataHandler()

# 現在の抽選状況を取得
@api_v1_raffle.route("/api/v1/raffle/next", methods=['GET'])
def route_raffle_next():
    if request.method == "GET":
        return jsonify({
          # 現在の当選リスト
          "current_mappings": [mapping._asdict() for mapping in data_handler.get_prize_winner_mappings()], 
          # 現在当選していない参加者リスト（ここから抽選する）
          "participants_pool": [participant._asdict() for participant in data_handler.get_prizeless_participants()], 
          # 次の景品
          "next_prize": {},
          # 次の景品が同一景品グループのうちの1つである場合はグループのIDリスト
          # そうでない場合はNone
          "prize_group": []
        })

