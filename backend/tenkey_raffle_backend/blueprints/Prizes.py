import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, request

from services.CsvParser import parse_prizes_csv
from services.PrizesManager import PrizesManager

api_v1_prizes = Blueprint('api_v1_prizes', __name__)

prizes_manager = PrizesManager()

  
@api_v1_prizes.route("/api/v1/prizes", methods=['GET', 'PUT', 'DELETE'])
def route_prizes():
    
    # GET -> 全景品リストを返す
    if request.method == "GET":
        return jsonify([prize._asdict() for prize in prizes_manager.get_all_prizes()])
    
    # PUT -> CSV読み込み、既存リストを破棄して置き換え
    elif request.method == "PUT":
        
        # CSVファイルが添付されてるか確認する
        if 'csv' not in request.files:
            return Response('ファイル「csv」が添付されていません', status=400)
        
        # CSVファイルを開く
        f = request.files['csv']
        with fdopen(f.stream.fileno(), 'rt') as csvfile:
            reader = csv.DictReader(csvfile)
            parsed_data = parse_prizes_csv(reader)
            csvfile.close()
            
        if parsed_data['error']:
            return Response({"parsed_prizes": 0, "error": parsed_data['error']}, status=400)
            
        successfully_imported = prizes_manager.import_new_prizes_list(parsed_data['prizes'])
        if not successfully_imported:
            return Response({"parsed_prizes": 0, "error": '抽選結果が存在する場合は景品リストの書き換えを行えません。'}, status=400)
        
        return Response({"parsed_prizes": len(prizes_manager.get_all_prizes()), "error": None}, status=201)
        
    # DELETE -> 全データ削除
    elif request.method == 'DELETE':
        success = prizes_manager.wipe_prizes_list()
        if success:
            return Response(f"景品データを削除しました。", status=200)
        else:
            return Response(f"抽選結果が存在する場合は景品リストの書き換えを行えません。", status=400)
