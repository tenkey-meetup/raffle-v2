import csv
from os import fdopen
from flask import Blueprint, Response, jsonify, make_response, request

from typedefs.FunctionReturnTypes import RaffleModificationStatus
from blueprints.forms.RaffleForms import RaffleSetWinnerForm, RaffleDeleteWinnerForm
from services.RaffleManager import RaffleManager
from services.PrizesManager import PrizesManager

api_v1_raffle = Blueprint('api_v1_raffle', __name__)

raffle_manager = RaffleManager()
prizes_manager = PrizesManager()

# =====

# 抽選結果
@api_v1_raffle.route("/api/v1/mappings", methods=['GET', 'DELETE'])
def route_mappings():
        
    # GET: 現在の抽選状況を取得する
    # 全景品リストを[{景品ID、当選者IDまたはNone}...]と返す
    if request.method == 'GET':
        all_prize_ids = prizes_manager.get_all_prize_ids()
        response_array = [{"prize_id": prize_id, "winner_id": raffle_manager.get_winner_for_prize(prize_id)} for prize_id in all_prize_ids]
        return make_response(jsonify(response_array), 200)
    
    elif request.method == 'DELETE':
        raffle_manager.wipe_prize_winner_mappings()
        return Response(status=200)

# 抽選編集
@api_v1_raffle.route("/api/v1/raffle", methods=['PUT', 'POST', 'DELETE'])
def route_raffle_set():
    
    # POST: 当選を書き込む
    # 既に景品が当選している場合は400を返す
    if request.method == 'POST':
        
        form = RaffleSetWinnerForm(request.form)
        if not form.validate():
            return Response(jsonify(form.errors), status=400)
        
        prize_id = request.form['prize_id']
        winner_id = request.form['winner_id']
        
        edit_status = raffle_manager.set_winner_for_prize(prize_id=prize_id, winner_id=winner_id, overwrite=False)
        if edit_status == RaffleModificationStatus.NONEXISTENT_PARTICIPANT_ID:
            return Response(f"受付番号「{winner_id}」の参加者は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NOT_OVERWRITING:
            return Response(f"景品「{prize_id}」は既に抽選済みです。", status=400)
        return Response(status=200)
    
    # PUT: 当選を上書きする
    # 主に抽選ミスの編集用
    elif request.method == 'PUT':
        
        form = RaffleSetWinnerForm(request.form)
        if not form.validate():
            return Response(jsonify(form.errors), status=400)
        
        prize_id = request.form['prize_id']
        winner_id = request.form['winner_id']
        
        edit_status = raffle_manager.set_winner_for_prize(prize_id=prize_id, winner_id=winner_id, overwrite=True)
        if edit_status == RaffleModificationStatus.NONEXISTENT_PARTICIPANT_ID:
            return Response(f"受付番号「{winner_id}」の参加者は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        return Response(status=200)
    
    # DELETE: 当選を取り消す
    elif request.method == 'DELETE':
        
        form = RaffleDeleteWinnerForm(request.form)
        if not form.validate():
            return Response(jsonify(form.errors), status=400)
        
        prize_id = request.form['prize_id']
        
        edit_status = raffle_manager.delete_winner_for_prize(prize_id=prize_id)
        if edit_status == RaffleModificationStatus.PRIZE_NOT_RAFFLED:
            return Response(f"管理番号「{prize_id}」の景品は抽選されていません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        
        return Response(status=200)
    
    