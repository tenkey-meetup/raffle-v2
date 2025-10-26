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


# 次の抽選を行う際に返すペイロード
def get_next_raffle_return_payload():
    
    next_prize = raffle_manager.get_next_prize()
    prize_group = None
    
    if next_prize is not None:
        prize_group = prizes_manager.get_prize_group(next_prize.id)
            
    return {
        # 現在の当選リスト
        "current_mappings": [mapping._asdict() for mapping in raffle_manager.get_prize_winner_mappings()], 
        # 現在当選していない参加者IDリスト（ここから抽選する）
        "participant_pool_ids": raffle_manager.get_participants_pool_ids(), 
        # 次の景品
        "next_prize": next_prize,
        # 次の景品が同一景品グループのうちの1つである場合はグループのIDリスト
        # そうでない場合はNone
        "prize_group_ids": prize_group
    }


# 現在の抽選状況を取得
@api_v1_raffle.route("/api/v1/raffle/next", methods=['GET'])
def route_raffle_next():
    if request.method == "GET":
        return make_response(jsonify(get_next_raffle_return_payload()), 200)


# 抽選結果を変更
@api_v1_raffle.route("/api/v1/raffle/set", methods=['PUT', 'POST', 'DELETE'])
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
            return Response(f"整理番号「{winner_id}」の参加者は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NOT_OVERWRITING:
            return Response(f"景品「{prize_id}」は既に抽選済みです。", status=400)
        
        return make_response(jsonify(get_next_raffle_return_payload()), 200)
    
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
            return Response(f"整理番号「{winner_id}」の参加者は存在しません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        
        return make_response(jsonify(get_next_raffle_return_payload()), 200)
    
    # DELETE: 当選を取り消す
    elif request.method == 'DELETE':
        
        form = RaffleDeleteWinnerForm(request.form)
        if not form.validate():
            return Response(jsonify(form.errors), status=400)
        
        prize_id = request.form['prize_id']
        
        edit_status = raffle_manager.delete_winner_for_prize(prize_id=prize_id)
        if not edit_status == RaffleModificationStatus.PRIZE_NOT_RAFFLED:
            return Response(f"管理番号「{prize_id}」の景品は抽選されていません。", status=400)
        elif edit_status == RaffleModificationStatus.NONEXISTENT_PRIZE_ID:
            return Response(f"管理番号「{prize_id}」の景品は存在しません。", status=400)
        
        return make_response(jsonify(get_next_raffle_return_payload()), status=200)
    
    