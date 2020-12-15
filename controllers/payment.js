const userSchema = require("../models/user");
const TransactionDoc = require("../models/Transactions");
const Work = require("../models/work");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { v4: uuidv4 } = require("uuid");

exports.trans = async function (req, res, next) {
  try {
    const { id } = req.params;
    const fetchtrans = await TransactionDoc.find({ userId: id });
    res.send(fetchtrans);
  } catch (err) {
    res.json({ message: err });
  }
};

exports.payment = async function (req, res, next) {
  console.log("started");
  const { work, token, uid, to } = req.body;
  const idempontencyKey = uuidv4();
  let cid;
  let charge;
  let savedCard;
  let email;
  userSchema
    .findById(uid)
    .then(async (response) => {
      //console.log(response);
      cid = response._id;
      email = response.email;
      res.send(response);
    })
    .catch(next);

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      savedCard = {
        stripe_customer_id: customer.id,
        card_brand: token.card.brand,
        last_four_digit: token.card.last4,
        exp_month: token.card.exp_month,
        exp_year: token.card.exp_year,
      };
      {
      }
      stripe.charges
        .create(
          {
            amount: work.cost * 100,
            currency: "inr",
            customer: customer.id,
            receipt_email: email,
            description: `Towards ${work.name}`,
            shipping: {
              name: token.card.name,
              address: {
                line1: "510 Townsend St",
                postal_code: "98140",
                city: "San Francisco",
                state: "CA",
                country: token.card.address_country,
              },
            },
          } //,{ idempontencyKey }
        )
        .then((charge) => {
          //console.log(cid);
          let transaction = {
            userId: cid, //uid
            amount: charge.amount / 100,
            receipt_url: charge.receipt_url,
            status: charge.status,
            receipt_no: charge.receipt_number,
            network_status: charge.outcome.network_status,
            seller_message: charge.outcome.seller_message,
            source: charge.source.id,
            charge_id: charge.id,
            balance_transaction_id: charge.balance_transaction,
            workof: work._id,
            to: to,
          };
          //console.log(savedCard);
          let savedCards = [];
          savedCards.push(savedCard);

          Promise.all([
            userSchema.findOneAndUpdate(
              { _id: cid },
              { $push: { savedCards: savedCard } }
            ),
            TransactionDoc.create(transaction).then((t) => {
              //console.log(t);
              let ctrans = [];
              ctrans.push(t._id);
              Work.findByIdAndUpdate(
                { _id: work._id },
                {
                  $push: { completedtransaction: ctrans },
                }
              ).then((w) => {
                //console.log(w);
              });
            }),
          ])
            .then(async (result) => {
              //**//
            })
            .catch(next);
        });
    })
    .then(async (result) => {
      //console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
