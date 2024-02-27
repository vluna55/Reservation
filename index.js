const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db.js");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    console.log(req.body);
    res
      .status(201)
      .send(
        await createReservation({ customer_id: req.params.id, ...req.body })
      );
  } catch (ex) {
    next(ex);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation(req.params.id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [Torie, Leo, Morgen, Perrys, Dakotas, Kirin, Rye] = await Promise.all([
    createCustomer("Torie"),
    createCustomer("Leo"),
    createCustomer("Morgen"),
    createRestaurant("Perrys"),
    createRestaurant("Dakotas"),
    createRestaurant("Kirin"),
    createRestaurant("Rye"),
  ]);
  console.log(`Leo has an id of ${Leo.id}`);
  console.log(`Perrys has an id of ${Perrys.id}`);

  await Promise.all([
    createReservation({
      customer_id: Leo.id,
      restaurant_id: Perrys.id,
      reservation_date: "04/01/2024",
    }),
    createReservation({
      customer_id: Torie.id,
      restaurant_id: Dakotas.id,
      reservation_date: "04/15/2024",
    }),
    createReservation({
      customer_id: Leo.id,
      restaurant_id: Kirin.id,
      reservation_date: "07/04/2024",
    }),
    createReservation({
      customer_id: Morgen.id,
      restaurant_id: Rye.id,
      reservation_date: "10/31/2024",
    }),
  ]);
  const reservations = await fetchReservations();
  console.log(reservations);
  await destroyReservation(reservations[0].id);
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
