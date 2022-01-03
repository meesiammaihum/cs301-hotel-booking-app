import os
import requests
import json
import pprint
import socket
import posbaccounts as posb
import ocbcaccounts as ocbc
import uobaccounts as uob

from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://cs301:cs301@localhost:3306/payment'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('db_conn') + '/payment'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_size': 100,
                                           'pool_recycle': 280}

db = SQLAlchemy(app)
app.config.update(
    DEBUG=True,
    SECRET_KEY="cs301",
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE = True,
    REMEMBER_COOKIE_SECURE = True
)

#CORS(app)
cors = CORS(
    app,
    resources={r"*": {"origins": "https://itsag1t4.com"}},
    supports_credentials=True
)

class Payment(db.Model):
    __tablename__ = 'payment'

    payment_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, nullable = False)
    bank_account_id = db.Column(db.Integer, nullable = True)
    title = db.Column(db.String(64), nullable=False)
    price = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(64), nullable=False)
    payment_mode = db.Column(db.String(64), nullable=False)
    bank = db.Column(db.String(20), nullable = True)
    points = 0
    #card_info includes (card_number, cvv, expiryDate) of a card that is supposed to send to payment processor
    card_info = ""
    card_number = db.Column(db.String(16), nullable = True)
  

    def __init__(self, customer_id, bank_account_id, title,  price, payment_status, payment_mode, bank, points,card_info,card_number):
        self.customer_id = customer_id
        self.bank_account_id = bank_account_id
        self.title = title
        self.price = price
        self.payment_status = payment_status
        self.payment_mode = payment_mode
        self.bank = bank
        self.points = points
        self.card_info = card_info
        self.card_number = card_number

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "customer_id": self.customer_id,
            "bank_account_id": self.bank_account_id,
            "title": self.title,
            "price": self.price,
            "payment_status": self.payment_status,
            "payment_mode": self.payment_mode,
            "bank": self.bank,
            "points":self.points,
            "card_info": self.card_info,
            "card_number": self.card_number
        }

def mask_number(card_number):
    s = f"{card_number:>016}"
    return s[:6] + "******" + s[-4:]


@app.route("/health")
def health_check():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return jsonify(
            {
                "message": "Payment Service is healthy",
                "ip_address": local_ip,
            }
    ), 200

@app.route("/test")
def test_check():
    return jsonify(
            {
                "message": "CI/CD test"
            }
    ), 200

@app.route("/payments", methods=['GET'])
def get_all_payments():
    payment_list = Payment.query.all()
    if len(payment_list) != 0:
        return jsonify(
            {
                "data":{
                    "Payments": [payment.to_dict() for payment in payment_list]
                }
            }
        ), 200
    return jsonify(
        {
            "message": "There are no payments."
        }
    ), 404

@app.route("/payments/<int:payment_id>", methods=["GET"])
def getPaymentInfo(payment_id):
    payment = Payment.query.filter_by(payment_id=payment_id).first()
    if payment:
        return jsonify(
            {
                "payment": payment.to_dict()
            }
        ), 200
    return jsonify(
        {
            "message": "Payment not found"
        }
    ), 404

@app.route("/payments", methods=["POST"])
def new_payment():
    try:
        data = request.get_json()
        payment = Payment(**data)
        points = data["points"]
        card_number = data["card_number"]
        mask_card_number = mask_number(card_number)
      

        user_exist = 0
        deducted = 0

        if points > 0:
            api_customer_response = requests.get("https://itsa-team4.com:5003/customers/"+str(data["customer_id"]))
            if(api_customer_response.status_code == 200):
                initial_point = api_customer_response.json()["customer"]["points"]
                

            if initial_point >= points:
                
                deducted_points = initial_point - points    
                body = {"points": deducted_points}
                headers = {
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip, deflate,br",
                    "Accept": "*/*"
                }
                api_points_response = requests.put("https://itsa-team4.com:5003/customers/"+str(data["customer_id"]), data=json.dumps(body), headers=headers)
               
            else:
                return jsonify(
                {
                    "message": "Insufficient points"
                }
            ), 400

        if payment.payment_mode == "Cash":
            payment.payment_status= "Pending"
            db.session.add(payment)
            db.session.commit()
            return jsonify(
                {
                    "payment": payment.to_dict()
                }
            ), 201

        elif payment.payment_mode == "Card":

            if payment.bank == "POSB":
                user_exist = posb.check_user(payment.bank_account_id)
                if user_exist == 1:
                    deducted = posb.deduct_amount(payment.bank_account_id, payment.price)       # return 0 or 1 
                    if deducted == 1:
                        payment.payment_status = "Paid"
                        payment.card_number = mask_card_number
                        db.session.add(payment)
                        db.session.commit()
                        return jsonify(
                                {
                                    "payment": payment.to_dict()
                                }
                            ), 201

            if payment.bank == "OCBC":
                user_exist = ocbc.check_user(payment.bank_account_id)
                if user_exist == 1:
                    deducted = ocbc.deduct_amount(payment.bank_account_id, payment.price)       # return 0 or 1 
                    if deducted == 1:
                        payment.payment_status = "Paid"
                        payment.card_number = mask_card_number
                        db.session.add(payment)
                        db.session.commit()
                        return jsonify(
                                {
                                    "payment": payment.to_dict()
                                }
                            ), 201

            if payment.bank == "UOB":
                user_exist = uob.check_user(payment.bank_account_id)
                if user_exist == 1:
                    deducted = uob.deduct_amount(payment.bank_account_id, payment.price)       # return 0 or 1 
                    if deducted == 1:
                        payment.payment_status = "Paid"
                        payment.card_number = mask_card_number
                        db.session.add(payment)
                        db.session.commit()
                        return jsonify(
                                {
                                    "payment": payment.to_dict()
                                }
                            ), 201

        if user_exist == 0:
            db.session.commit()
            return jsonify(
                {
                    "payment": "Unsuccessful, no such account in bank!"
                }
            ), 400
        if deducted == 0:
            db.session.commit()
            return jsonify(
                {
                    "payment": "Unsuccessful, not enough balance!"
                }
            ), 400

    except Exception as e:
        return jsonify(
            {
                "message": "An error occurred creating the payment.",
                "error": str(e)
            }
        ), 500

    return jsonify(
        {
            "payment": payment.to_dict()
        }
    ), 201

@app.route("/payments/<int:payment_id>", methods=["PATCH"])
def update_payment(payment_id):
    payment = Payment.query.with_for_update(of=Payment).filter_by(payment_id=payment_id).first()
    if payment is not None:
        data = request.get_json()
        if 'customer_id' in data.keys(): 
            payment.customer_id = data['customer_id']
        if 'bank_account_id' in data.keys(): 
            payment.bank_account_id = data['bank_account_id']
        if 'payment_status' in data.keys(): 
            payment.payment_status = data['payment_status']
        if 'title' in data.keys(): 
            payment.title = data['title']
        if 'price' in data.keys(): 
            payment.price = data['price']
        if 'payment_mode' in data.keys(): 
            payment.payment_mode = data['payment_mode']
        if 'bank' in data.keys(): 
            payment.bank = data['bank']
        try:
            db.session.commit()
        except Exception as e:
            return jsonify(
                {
                    "message": "An error occurred updating the payment.",
                    "error": str(e)
                }
            ), 500
        return jsonify(
            {
                "data": payment.to_dict()
            }
        )
    return jsonify(
        {
            "data": {
                "payment_id": payment_id
            },
            "message": "Payment not found."
        }
    ), 404

@app.route("/payments/<int:payment_id>", methods=["DELETE"])
def delete_payment(payment_id):
    payment = Payment.query.filter_by(payment_id=payment_id).first()
    if payment is not None:
        try:
            db.session.delete(payment)
            db.session.commit()
        except Exception as e:
            return jsonify(
                {
                    "message": "An error occurred deleting the payment.",
                    "error": str(e)
                }
            ), 500
        return jsonify(
            {
                "data": {
                    "payment_id": payment_id
                }
            }
        ), 200
    return jsonify(
        {
            "data": {
                "payment_id": payment_id
            },
            "message": "Payment not found."
        }
    ), 404




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
