import { PrismaClient } from "@prisma/client";
import express from "express";
import { addCTPL } from "../../model/Reference/ctpl.model";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import { v4 as uuid } from "uuid";
const testReport = express.Router();
const prisma = new PrismaClient({
  datasources: {
    db: { url: "mysql://root:charles@localhost:3306/upward_insurance_umis" },
  },
});
let countResponse = 0;
let prev = "";
testReport.post("/add-petty-log", async (req, res) => {
  const data = JSON.parse(req.body.dataString)[0];
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.petty_log.create({
    data,
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});

testReport.post("/add-client", async (req, res) => {
  const data = JSON.parse(req.body.dataString)[0];

  var checkYear1 = prev.substring(2, 4);
  var checkYear2 = data.DateIssued.substring(2, 4);

  if (prev !== "" && checkYear1 !== checkYear2) {
    countResponse = 1;
  } else {
    countResponse++;
  }

  const new_id = `C-${data.DateIssued}-${countResponse
    .toString()
    .padStart(3, "0")}`;
  const old_id = data.IDNo;

  const getSubAcctId = await prisma.sub_account.findMany({
    where: { Acronym: data.Sub_Acct },
  });

  await prisma.id_from_2020.create({
    data: {
      new_id,
      old_id,
      type: "client",
    },
  });

  const contact_details_id = uuid();

  await prisma.contact_details.create({
    data: {
      contact_details_id,
      mobile: data.Contact,
    },
  });

  await prisma.entry_client.create({
    data: {
      entry_client_id: new_id,
      address: data.Address,
      company: data.Individual === 1 ? data.Firstname : "",
      firstname: data.Individual === 0 ? data.Firstname : "",
      lastname: data.Lastname,
      middlename: data.Middle,
      sub_account: getSubAcctId[0].Sub_Acct,
      client_contact_details_id: contact_details_id,
      option: data.Individual === 0 ? "individual" : "company",
    },
  });
  prev = data.DateIssued;
  res.send({
    message: "test Report",
  });
});

testReport.post("/add-agent", async (req, res) => {
  const data = JSON.parse(req.body.dataString)[0];
  var checkYear1 = prev.substring(2, 4);
  var checkYear2 = data.DateIssued.substring(2, 4);

  if (prev !== "" && checkYear1 !== checkYear2) {
    countResponse = 1;
  } else {
    countResponse++;
  }

  const new_id = `A-${data.DateIssued}-${countResponse
    .toString()
    .padStart(3, "0")}`;
  const old_id = data.IDNo;

  const getSubAcctId = await prisma.sub_account.findMany({
    where: { Acronym: data.Sub_Acct },
  });

  await prisma.id_from_2020.create({
    data: {
      new_id,
      old_id,
      type: "agent",
    },
  });

  const contact_details_id = uuid();

  await prisma.contact_details.create({
    data: {
      contact_details_id,
      mobile: data.Contact,
    },
  });

  await prisma.entry_agent.create({
    data: {
      entry_agent_id: new_id,
      address: data.Address,
      firstname: data.Firstname,
      lastname: data.Lastname,
      middlename: data.Middle,
      sub_account: getSubAcctId[0].Sub_Acct,
      agent_contact_details_id: contact_details_id,
    },
  });
  prev = data.DateIssued;
  res.send({
    message: "test Report",
  });
});
testReport.post("/add-journal", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.journal.create({
    data: {
      ...data,
      Source_No_Ref_ID: "",
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
function getZeroFirstInput(data: string) {
  let addZeroFromSeries = "";
  for (let i = 0; i < data.length; i++) {
    if (data.charAt(i) === "0") {
      addZeroFromSeries += "0";
    } else {
      break;
    }
  }
  return addZeroFromSeries;
}
testReport.post("/ctpl-registration", async (req, res) => {
  const data = JSON.parse(req.body.dataString)[0];
  delete data.CreatedDate;
  const ctplID = await generateUniqueUUID("ctplregistration", "ctplId");
  console.log(data);

  await addCTPL(
    {
      ...data,
      ctplId: ctplID,
    },
    req
  );

  res.send({ message: "qweqwe" });
});
testReport.post("/add-policy", async (req, res) => {
  const data = JSON.parse(req.body.dataString)[0];
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.policy.create({
    data,
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-vpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.vpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-fpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.fpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-papolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.papolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-msprpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.msprpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-bpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.bpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-mpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.mpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-cglpolicy", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  console.log(`data :${req.body.count} :`, req.body.dataString);
  await prisma.cglpolicy.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-chart-account", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  await prisma.chart_account.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});

testReport.post("/add-rates", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  const { Account, Line, Type, Rate } = data[0];

  await prisma.rates.create({
    data: {
      Account,
      Line,
      Type,
      Rate,
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});

testReport.post("/add-transaction-code", async (req, res) => {
  try {
    const data = JSON.parse(req.body.dataString);

    await prisma.transaction_code.create({
      data: {
        ...data[0],
      },
    });

    res.send({
      message: "test Report",
      vehiclePolicy: [],
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      vehiclePolicy: [],
    });
  }
});
testReport.post("/add-bankaccounts", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  await prisma.bankaccounts.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-pettycash", async (req, res) => {
  const data = JSON.parse(req.body.dataString);
  await prisma.petty_log.create({
    data: {
      ...data[0],
    },
  });

  res.send({
    message: "test Report",
    vehiclePolicy: [],
  });
});
testReport.post("/add-books", async (req, res) => {
  try {
    const data = JSON.parse(req.body.dataString);
    console.log(data);
    await prisma.books.create({
      data: {
        ...data[0],
      },
    });

    res.send({
      message: "test Report",
      vehiclePolicy: [],
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      vehiclePolicy: [],
    });
  }
});
testReport.post("/add-policy-account", async (req, res) => {
  try {
    const data = JSON.parse(req.body.dataString);

    await prisma.policy_account.create({
      data: {
        ...data[0],
      },
    });

    res.send({
      message: "test Report",
      vehiclePolicy: [],
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      vehiclePolicy: [],
    });
  }
});
testReport.post("/add-xsubsidiary", async (req, res) => {
  try {
    const data = JSON.parse(req.body.dataString);

    await prisma.xsubsidiary.create({
      data: {
        ...data[0],
      },
    });

    res.send({
      message: "test Report",
      vehiclePolicy: [],
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      vehiclePolicy: [],
    });
  }
});

export default testReport;
