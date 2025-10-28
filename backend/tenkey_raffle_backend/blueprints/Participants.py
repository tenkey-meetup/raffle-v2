import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, make_response, request
from markupsafe import escape

from services.RaffleManager import RaffleManager
from services.CsvParser import parse_participants_csv
from services.ParticipantsManager import ParticipantsManager
from typedefs.FunctionReturnTypes import AttendanceModificationStatus

api_v1_participants = Blueprint('api_v1_participants', __name__)

participants_manager = ParticipantsManager()
raffle_manager = RaffleManager()


# 全参加者ルート
@api_v1_participants.route("/api/v1/participants", methods=['GET', 'PUT', 'DELETE'])
def route_participants():
    
    # GET -> 全参加者リストを返す
    if request.method == "GET":
        return jsonify([participant._asdict() for participant in participants_manager.get_all_participants()])
    
    # PUT -> CSV読み込み、既存リストを破棄して置き換え
    elif request.method == "PUT":
        
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(raffle_manager.get_prize_winner_mappings()) > 0:
            return make_response(jsonify({"parsed_participants": 0, "error": '抽選結果が存在する場合は参加者リストの書き換えを行えません。'}), 400)
        
        # CSVファイルが添付されてるか確認する
        if 'csv' not in request.files:
            return make_response(jsonify({"parsed_participants": 0, "error": 'ファイル「csv」が添付されていません'}), 400)
        
        # CSVファイルを開く
        f = request.files['csv']
        with fdopen(f.stream.fileno(), 'rt') as csvfile:
            
            reader = csv.DictReader(csvfile)
            parsed_data = parse_participants_csv(reader)
            csvfile.close()
            
        if parsed_data['error']:
            return make_response(jsonify({"parsed_participants": 0, "error": parsed_data['error']}), 400)
        
        participants_manager.import_new_participants_list(parsed_data['participants'])
        return make_response(jsonify({"parsed_participants": len(participants_manager.get_all_participants()), "error": None}), 201)
    
    # DELETE -> 全データ削除
    elif request.method == 'DELETE':
        # もし抽選結果が存在する場合、参加者リストの置き換えを許さない
        if len(raffle_manager.get_prize_winner_mappings()) > 0:
            return Response('抽選結果が存在する場合は参加者リストの書き換えを行えません。', status=400)
        participants_manager.wipe_participants_list()
        return Response(f"参加者データを削除しました。", status=200)
    
        
# 全不参加ルート
@api_v1_participants.route("/api/v1/participants/cancels/all", methods=['GET', 'PUT', 'DELETE'])
def route_participants_all_cancels():
    
    # GET -> 当日不参加リストを取得
    if request.method == "GET":
        return jsonify(participants_manager.get_all_cancel_ids())
    
    # DELETE -> 不参加リストを削除
    elif request.method == 'DELETE':
        participants_manager.wipe_cancels()
        return Response(status=200)
    
    
# 不参加編集ルート
@api_v1_participants.route("/api/v1/participants/cancels/edit", methods=['PUT', 'DELETE'])
def route_participants_batch_cancels():
    
    # PUT -> 指定された参加者を不参加リストに加える
    if request.method == 'PUT':
        
        # RequestのJsonからIDリストを取得
        request_payload = request.get_json()
        if not request_payload:
            return Response('RequestにIDリストをJSONとして追加してください。', status=400)
        if not isinstance(request_payload, list):
            return Response('RequestにIDリストをJSONとして追加してください。', status=400)
        
        success = []
        skipped = []
        nonexistent_ids = []
        
        for id in request_payload:
            if not isinstance(id, str):
                return Response('文字列以外のIDが含まれてます', status=400)
            processing_response = participants_manager.add_cancel(id)
            if processing_response == AttendanceModificationStatus.PROCESSED_SUCCESSFULLY:
                success.append(id)
            elif processing_response == AttendanceModificationStatus.ALREADY_PROCESSED:
                skipped.append(id)
            else:
                nonexistent_ids.append(id)
                
        return make_response(jsonify({
            "success": success,
            "skipped": skipped,
            "nonexistent_ids": nonexistent_ids
        }), 200)
                
    # DELETE -> 指定された参加者を不参加リストから削除する
    elif request.method == 'DELETE':
        
        # RequestのJsonからIDリストを取得
        request_payload = request.get_json()
        if not request_payload:
            return Response('RequestにIDリストをJSONとして追加してください。', status=400)
        if not isinstance(request_payload, list):
            return Response('RequestにIDリストをJSONとして追加してください。', status=400)
        
        success = []
        skipped = []
        nonexistent_ids = []
        
        for id in request_payload:
            processing_response = participants_manager.remove_cancel(id)
            if processing_response == AttendanceModificationStatus.PROCESSED_SUCCESSFULLY:
                success.append(id)
            elif processing_response == AttendanceModificationStatus.ALREADY_PROCESSED:
                skipped.append(id)
            else:
                nonexistent_ids.append(id)
                
        return make_response(jsonify({
            "success": success,
            "skipped": skipped,
            "nonexistent_ids": nonexistent_ids
        }), 200)

