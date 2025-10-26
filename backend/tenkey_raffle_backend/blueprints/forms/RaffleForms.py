

from wtforms import Form, StringField, validators


class RaffleSetWinnerForm(Form):
    prize_id = StringField('景品ID', [validators.DataRequired()])
    winner_id = StringField('景品ID', [validators.DataRequired()])
    
class RaffleDeleteWinnerForm(Form):
    prize_id = StringField('景品ID', [validators.DataRequired()])