import os
import requests
import json
import pprint

from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://cs301:cs301@localhost:3306/payment'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_size': 100,
                                           'pool_recycle': 280}

db = SQLAlchemy(app)

CORS(app)


class Bank(db.Model):
    __tablename__ = 'uobaccounts'

    account_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    card_number = db.Column(db.String(16), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    bank = db.Column(db.String(64), nullable=False)
    cust_id = db.Column(db.Integer, nullable=False)
    balance = db.Column(db.Float, nullable=False) 

    def __init__(self, name, card_number, expiry_date, bank, cust_id, balance):
        def mask_number(card_number):
            s = f"{card_number:>016}"
            return s[:6] + "******" + s[-4:]

        self.name = name
        self.card_number = mask_number(card_number)
        self.expiry_date = expiry_date
        self.bank = bank
        self.cust_id = cust_id
        self.balance = balance


    def to_dict(self):
        return {
            "account_id": self.account_id,
            "name": self.name,
            "card_number": self.card_number,
            "expiry_date": self.expiry_date,
            "bank": self.bank,
            "cust_id": self.cust_id,
            "balance": self.balance,
        }

@app.route("/health")
def health_check():
    return jsonify(
            {
                "message": "Service is healthy."
            }
    ), 200

def check_user(bank_account_id):
    bank = Bank.query.with_for_update(of=Bank).filter_by(account_id=bank_account_id).first()
    if bank is not None:
        return 1
    return 0

def check_payable(bank_account_id, price):
    bank = Bank.query.with_for_update(of=Bank).filter_by(account_id=bank_account_id).first()
    if bank.balance >= price:
        try:
            db.session.commit()
            return 1
        except Exception as e:
            return 0
    try:
        db.session.commit()
        return 0
    except Exception as e:
        return 0
    return 0

def deduct_amount(account_id, price):                                                   # to deduct the amount
    bank = Bank.query.with_for_update(of=Bank).filter_by(account_id=account_id).first()
    if bank is not None:
        check = check_payable(account_id, price)
        if check == 1:
            deducted = bank.balance - price
            bank.balance = deducted
            try:
                db.session.commit()
                return 1
            except Exception as e:
                return 0
    try:
        db.session.commit()
        return 0
    except Exception as e:
        return 0

@app.route("/bankaccounts", methods=["POST"])
def new_bankaccount():
    try:
        data = request.get_json()
        bank = Bank(**data)
        db.session.add(bank)
        db.session.commit()
    
    except Exception as e:
        return jsonify(
            {
                "message": "An error occurred creating the bank account.",
                "error": str(e)
            }
        ), 500

    return jsonify(
        {
            "bankaccount": bank.to_dict()
        }
    ), 201

@app.route("/bankaccounts/<int:account_id>", methods=["PUT"])           # to update the balance of the account
def update_balance(account_id):
    bank = Bank.query.with_for_update(of=Bank).filter_by(account_id=account_id).first()
    if bank is not None:
        data = request.get_json()
        if 'balance' in data.keys(): 
            bank.balance = data['balance']
        try:
            db.session.commit()
        except Exception as e:
            return jsonify(
                {
                    "message": "An error occurred updating the bank.",
                    "error": str(e)
                }
            ), 500
        return jsonify(
            {
                "data": bank.to_dict()
            }
        )
    return jsonify(
        {
            "data": {
                "account_id": account_id
            },
            "message": "bank account not found."
        }
    ), 404

@app.route("/bankaccounts/<int:account_id>", methods=["DELETE"])                # to delete bank account
def delete_bank_account(account_id):
    bank = Bank.query.filter_by(account_id=account_id).first()
    if bank is not None:
        try:
            db.session.delete(bank)
            db.session.commit()
        except Exception as e:
            return jsonify(
                {
                    "message": "An error occurred deleting the bank.",
                    "error": str(e)
                }
            ), 500
        return jsonify(
            {
                "data": {
                    "account_id": account_id
                }
            }
        ), 200
    return jsonify(
        {
            "data": {
                "account_id": account_id
            },
            "message": "bank not found."
        }
    ), 404

# @app.route("/bankaccounts", methods=['GET'])
# def get_all_bank():
#     bank_list = Bank.query.all()
#     if len(bank_list) != 0:
#         return jsonify(
#             {
#                 "data":{
#                     "bank": [bank.to_dict() for bank in bank_list]
#                 }
#             }
#         ), 200
#     return jsonify(
#         {
#             "message": "There are no accounts."
#         }
#     ), 404

# @app.route("/bankaccounts/<int:account_id>", methods=["GET"])
# def getbankInfo(account_id):
#     bank = Bank.query.filter_by(account_id=account_id).first()
#     if bank:
#         return jsonify(
#             {
#                 "bank": bank.to_dict()
#             }
#         ), 200
#     return jsonify(
#         {
#             "message": "Account not found"
#         }
#     ), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5011, debug=True)
