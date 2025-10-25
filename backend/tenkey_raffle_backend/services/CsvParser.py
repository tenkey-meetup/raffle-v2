
from csv import DictReader
from typing import NamedTuple, TypedDict
from types.RaffleDatatypes import Participant, Prize, WinnerMapping



class ParticipantsParserReturnType(TypedDict):
    participants: list[Participant]
    error: str | None

# 参加者CSVを解析
def parse_participants_csv(participants_reader: DictReader[str]) ->  ParticipantsParserReturnType:
    
    # 読み込みデータ管理
    participants: list[Participant] = []
    
    # データ内容の確認用
    error_msg: str | None = None
    seen_participant_ids: list[str] = []
    duplicate_participant_ids: list[str] = []
    faulty_attendance_status_ids: list[str] = []
    
    # CSVの確認
    participants_headers = participants_reader.fieldnames
    if 'ユーザー名' not in participants_headers:
        error_msg = '参加者CSVに「ユーザー名」列がありません'
    elif '表示名' not in participants_headers:
        error_msg = '参加者CSVに「表示名」列がありません'
    elif '参加ステータス' not in participants_headers:
        error_msg = '参加者CSVに「参加ステータス」列がありません'
    elif '受付番号' not in participants_headers:
        error_msg = '参加者CSVに「受付番号」列がありません'
    
    for row in participants_reader:
        id = row['受付番号']
        # 参加ステータスの確認
        if row['参加ステータス'] != "参加" and row['参加ステータス'] != "参加キャンセル":
            faulty_attendance_status_ids.append(row['受付番号']) 
        # 重複IDの確認
        if id in seen_participant_ids:
            duplicate_participant_ids.append(id)
        else:
            seen_participant_ids.append(id)
        participants.append(Participant(
            registration_id=id,
            username=row['ユーザー名'],
            display_name=row['表示名'],
            connpass_attending=True if row['参加ステータス'] == "参加" else False,
        ))
    
    if error_msg: 
        return {
            "participants": [],
            "error": error_msg
        }
    elif len(faulty_attendance_status_ids) > 0:
        return {
            "participants": [],
            "error": f"参加者CSVに「参加ステータス」が参加・参加キャンセル以外の参加者が存在します（{str(faulty_attendance_status_ids)}）"
        }  
    elif len(duplicate_participant_ids) > 0:
        return {
            "prizes": [],
            "error": f"参加者CSVに受付番号の重複があります（{str(set(duplicate_participant_ids))}）"
        }
        
    return {
        "participants": participants,
        "error": None
    } 
    
    

class PrizesParserReturnType(TypedDict):
    prizes: list[Prize]
    error: str | None

# 参加者CSVを解析
def parse_prizes_csv(prizes_reader: DictReader[str]) ->  PrizesParserReturnType:
    
    # 読み込みデータ管理
    prizes: list[Prize] = []
    
    # データ内容の確認用
    error_msg: str | None = None
    seen_prize_ids: list[str] = []
    duplicate_prize_ids: list[str] = []
    
    prizes_headers = prizes_reader.fieldnames
    if '管理No' not in prizes_headers:
        error_msg = '景品CSVに「管理No」列がありません'
    elif '提供元' not in prizes_headers:
        error_msg = '景品CSVに「提供元」列がありません'
    elif '景品名' not in prizes_headers:
        error_msg = '景品CSVに「景品名」列がありません'
    for row in prizes_reader:
        id = row['管理No']
        # 重複IDの確認
        if id in seen_prize_ids:
            duplicate_prize_ids.append(id)
        else:
            seen_prize_ids.append(id)
        prizes.append(Prize(
            id=id,
            provider=row['提供元'],
            display_name=row['景品名']
        )) 
      
    if error_msg:
        return {
            "prizes": [],
            "error": error_msg
        }  
    elif len(duplicate_prize_ids) > 0:
        return {
            "prizes": [],
            "error": f"景品CSVに景品IDの重複があります（{str(set(duplicate_prize_ids))}）"
        }
        
    return {
        "prizes": prizes,
        "error": None
    } 
    
    

class WinnersParserReturnType(TypedDict):
    winner_mappings: list[WinnerMapping]
    error: str | None
    
# 当選者CSVを解析
def parse_winners_csv(winners_reader: DictReader[str], participants: list[Participant], prizes: list[Prize]) ->  WinnersParserReturnType:
    
    # 読み込みデータ管理
    winner_mappings: list[WinnerMapping] = []
    
    # データ内容の確認用
    error_msg: str | None = None
    seen_prize_ids: list[str] = []
    duplicate_prize_ids: list[str] = []
    unknown_prize_ids: list[str] = []
    unknown_participant_ids: list[str] = []
    
    winners_headers = winners_reader.fieldnames
    if '景品ID' not in winners_headers:
        error_msg = '当選者リストCSVに「景品ID」列がありません'
    elif '当選者受付番号' not in winners_headers:
        error_msg = '当選者リストCSVに「当選者受付番号」列がありません'
        
    # 存在する景品・参加者IDリストを作製
    all_prize_ids = [prize.id for prize in prizes]
    all_participant_ids = [participant.registration_id for participant in participants]
        
    for row in winners_reader:
        prize_id = row['景品ID']
        participant_id = row['当選者受付番号']
        
        # 景品の確認
        if prize_id in seen_prize_ids: 
            duplicate_prize_ids.append(prize_id)
        else:
            seen_prize_ids.append(prize_id)
            
        # 存在しない参加者・景品IDの確認
        if prize_id not in all_prize_ids:
            unknown_prize_ids.append(prize_id)
        if participant_id not in all_participant_ids:
            unknown_participant_ids.append(participant_id)
            
        winner_mappings.append(WinnerMapping(
            prize_id=prize_id,
            participant_id=participant_id
        )) 
      
    if error_msg:
        return {
            "winner_mappings": [],
            "error": error_msg
        }  
    elif len(duplicate_prize_ids) > 0:
        return {
            "winner_mappings": [],
            "error": f"当選者リストCSVに景品IDの重複があります（{str(set(duplicate_prize_ids))}）"
        }
    elif len(unknown_prize_ids) > 0:
        return {
            "winner_mappings": [],
            "error": f"当選者リストCSVに存在しない景品IDが含まれてます（{str(set(unknown_prize_ids))}）"
        }
    elif len(unknown_participant_ids) > 0:
        return {
            "winner_mappings": [],
            "error": f"当選者リストCSVに存在しない参加者整理番号が含まれてます（{str(set(unknown_participant_ids))}）"
        }
        
    return {
        "winner_mappings": winner_mappings,
        "error": None
    } 