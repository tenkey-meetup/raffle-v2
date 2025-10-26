import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, make_response, request

from services.RaffleManager import RaffleManager
from services.CsvParser import parse_prizes_csv
from services.PrizesManager import PrizesManager

api_v1_prizes = Blueprint('api_v1_prizes', __name__)

prizes_manager = PrizesManager()
raffle_manager = RaffleManager()
  
@api_v1_prizes.route("/api/v1/prizes", methods=['GET', 'PUT', 'DELETE'])
def route_prizes():
    
    # GET -> 全景品リストを返す
    if request.method == "GET":
        return jsonify([prize._asdict() for prize in prizes_manager.get_all_prizes()])
    
    # PUT -> CSV読み込み、既存リストを破棄して置き換え
    elif request.method == "PUT":
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(raffle_manager.get_prize_winner_mappings()) > 0:
            return make_response(jsonify({"parsed_prizes": 0, "error": '抽選結果が存在する場合は景品リストの書き換えを行えません。'}), 400)
        
        # CSVファイルが添付されてるか確認する
        if 'csv' not in request.files:
            return make_response(jsonify({"parsed_prizes": 0, "error": 'ファイル「csv」が添付されていません'}), 400)
        
        # CSVファイルを開く
        f = request.files['csv']
        with fdopen(f.stream.fileno(), 'rt') as csvfile:
            reader = csv.DictReader(csvfile)
            parsed_data = parse_prizes_csv(reader)
            csvfile.close()
            
        if parsed_data['error']:
            return make_response(jsonify({"parsed_prizes": 0, "error": parsed_data['error']}), 400)
            
        prizes_manager.import_new_prizes_list(parsed_data['prizes'])
        return make_response(jsonify({"parsed_prizes": len(prizes_manager.get_all_prizes()), "error": None}), 201)
        
    # DELETE -> 全データ削除
    elif request.method == 'DELETE':
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(raffle_manager.get_prize_winner_mappings()) > 0:
            return Response('抽選結果が存在する場合は景品リストの書き換えを行えません。', status=400)
        prizes_manager.wipe_prizes_list()
        return Response(f"景品データを削除しました。", status=200)
