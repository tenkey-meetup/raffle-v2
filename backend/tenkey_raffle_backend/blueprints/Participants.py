import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, request
from markupsafe import escape

from services.CsvParser import parse_participants_csv
from services.DataHandler import DataHandler
from types.FunctionReturnTypes import AttendanceModificationStatus

api_v1_participants = Blueprint('api_v1_participants', __name__)

data_handler = DataHandler()


# 全参加者ルート
@api_v1_participants.route("/api/v1/participants", methods=['GET', 'PUT', 'DELETE'])
def route_participants():
    
    # GET -> 全参加者リストを返す
    if request.method == "GET":
        return jsonify([participant._asdict() for participant in data_handler.get_all_participants()])
    
    # PUT -> CSV読み込み、既存リストを破棄して置き換え
    elif request.method == "PUT":
        
        # CSVファイルが添付されてるか確認する
        if 'csv' not in request.files:
            return Response({"parsed_participants": 0, "error": 'ファイル「csv」が添付されていません'}, status=400)
        
        # CSVファイルを開く
        f = request.files['csv']
        with fdopen(f.stream.fileno(), 'rt') as csvfile:
            
            reader = csv.DictReader(csvfile)
            parsed_data = parse_participants_csv(reader)
            csvfile.close()
            
        if parsed_data['error']:
            return Response({"parsed_participants": 0, "error": parsed_data['error']}, status=400)
        
        successfully_imported = data_handler.import_new_participants_list(parsed_data['participants'])
        if not successfully_imported:
            return Response({"parsed_participants": 0, "error": '抽選結果が存在する場合は参加者リストの書き換えを行えません。'}, status=400)
        
        return Response({"parsed_participants": len(data_handler.get_all_participants()), "error": None}, status=201)
    
    # DELETE -> 全データ削除
    elif request.method == 'DELETE':
        data_handler.wipe_participants_list()
        return Response(f"参加者データを削除しました。", status=200)


# 参加者ID指定ルート
@api_v1_participants.route("/api/v1/participants/by-id/<id>", methods=['GET'])
def route_participants_id(id: str):
    
    # GET -> 参加者の情報を取得
    if request.method == "GET":
        id_safe = escape(id)
        participant = data_handler.get_participant_by_id(id_safe)
        if not participant:
            return Response(f"ID「{id_safe}」の参加者は見つかりませんでした。", status=404)
        else:
            return jsonify(participant._asdict())
        
# 当日不参加管理ルート
@api_v1_participants.route("/api/v1/participants/cancels", methods=['GET', 'PUT', 'DELETE'])
def route_participants_availability():
    
    # GET -> 当日不参加リストを取得
    if request.method == "GET":
        return jsonify(data_handler.get_all_cancel_ids())
    
    # PUT -> 指定された参加者を不参加リストに加える
    elif request.method == 'PUT':
        
        # RequestのFormにavailable_dayofが付いているかを確認する
        if not request.form['ids']:
            return Response('Requestの「ids」が指定がされていません。', status=400)
        ids = request.form['ids']
        if not isinstance(ids, list):
            return Response('idsはIDリストとして定義してください')
        
        success = []
        skipped = []
        nonexistent_ids = []
        
        for id in ids:
            processing_response = data_handler.add_cancel(id)
            if processing_response == AttendanceModificationStatus.PROCESSED_SUCCESSFULLY:
                success.append(id)
            elif processing_response == AttendanceModificationStatus.ALREADY_PROCESSED:
                skipped.append(id)
            else:
                nonexistent_ids.append(id)
                
        return Response({
            "success": success,
            "skipped": skipped,
            "nonexistent_ids": nonexistent_ids
        }, status=200)
                
    # DELETE -> 指定された参加者を不参加リストから削除する
    elif request.method == 'DELETE':
        
        # RequestのFormにavailable_dayofが付いているかを確認する
        if not request.form['ids']:
            return Response('Requestの「ids」が指定がされていません。', status=400)
        ids = request.form['ids']
        if not isinstance(ids, list):
            return Response('idsはIDリストとして定義してください')
        
        success = []
        skipped = []
        nonexistent_ids = []
        
        for id in ids:
            processing_response = data_handler.add_cancel(id)
            if processing_response == AttendanceModificationStatus.PROCESSED_SUCCESSFULLY:
                success.append(id)
            elif processing_response == AttendanceModificationStatus.ALREADY_PROCESSED:
                skipped.append(id)
            else:
                nonexistent_ids.append(id)
                
        return Response({
            "success": success,
            "skipped": skipped,
            "nonexistent_ids": nonexistent_ids
        }, status=200)

