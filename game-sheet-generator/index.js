import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as fs from "fs";
import { faker } from "@faker-js/faker";

const createPlayer = () => {
  return {
    name: faker.person.fullName(),
    jersey: faker.number.int({ min: 1, max: 99 }),
  };
};

const createTeam = (numPlayers) => {
  const res = [];
  for (let i = 0; i < numPlayers; i++) {
    res.push(createPlayer());
  }
  return res;
};

const matchDetails = {
  matchTitle: "G1 Match 1",
  ballSize: 5,
  matchDuration: 30,
  field: 2,
  time: "12:00",
  date: "09 May 2023",
  category: "M05",
  homeTeam: {
    name: "Test 1",
    roster: createTeam(8),
  },
  awayTeam: {
    name: "Test 2",
    roster: createTeam(6),
  },
};

const createRosterTable = (matchDetails) => {
  const rows = [];
  const numRows = Math.max(
    matchDetails.homeTeam.roster.length,
    matchDetails.homeTeam.roster.length
  );
  for (let i = 0; i < numRows; i++) {
    const homePlayer = matchDetails.homeTeam.roster[i];
    const awayPlayer = matchDetails.awayTeam.roster[i];
    const homeSideRow = [
      homePlayer ? homePlayer.jersey : {},
      homePlayer ? homePlayer.name : {},
      {},
      {},
      {},
    ];
    const awaySideRow = [
      awayPlayer ? awayPlayer.jersey : {},
      awayPlayer ? awayPlayer.name : {},
      {},
      {},
      {},
    ];
    rows.push([...homeSideRow, sepCell(), ...awaySideRow]);
  }
  return rows;
};

const loadImage = (filename, type) => {
  return `data:image/${type};base64,${fs.readFileSync(`./assets/${filename}`, {
    encoding: "base64",
  })}`;
};

const sepCell = () => {
  return {
    text: "",
    fillColor: "#000",
  };
};

var docDefinition = {
  content: [
    {
      columns: [
        {
          // under NodeJS (or in case you use virtual file system provided by pdfmake)
          // you can also pass file names here
          image: loadImage("gc-logo.png", "png"),
          width: 100,
        },
        {
          stack: [
            { text: "Gold Cup Match Sheet", width: "*", style: "header" },
            { text: matchDetails.matchTitle, style: "subtitle" },
          ],
          margin: [0, 20, 0, 0],
        },
        {
          image: loadImage("fairplay.jpg", "jpeg"),
          width: 100,
        },
      ],
      margin: [0, 0, 0, 20],
    },
    {
      columns: [
        {
          text: "Field Marshall: ______________________",
          width: "auto",
        },
        {
          text: `Ball Size: ${matchDetails.ballSize}`,
          alignment: "right",
        },
      ],
      margin: [0, 0, 0, 20],
    },
    {
      columns: [
        {
          text: "Scorekeeper: ________________________",
          width: "auto",
        },
        {
          text: `Match Duration: ${matchDetails.matchDuration}`,
          alignment: "right",
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {
          text: `Date: ${matchDetails.date}`,
        },
        {
          text: `Time: ${matchDetails.time}`,
        },
        {
          text: `Field: ${matchDetails.field}`,
          alignment: "right",
        },
        {
          text: `Category: ${matchDetails.category}`,
          alignment: "right",
        },
      ],
    },
    {
      margin: [0, 10, 0, 10],
      fontSize: 11,
      table: {
        headerRows: 2,
        widths: ["auto", "*", 35, 26, 26, 5, "auto", "*", 35, 26, 26],
        body: [
          [
            {
              text: matchDetails.homeTeam.name,
              colSpan: 5,
              alignment: "center",
              bold: true,
            },
            {},
            {},
            {},
            {},
            sepCell(),
            {
              text: matchDetails.awayTeam.name,
              colSpan: 5,
              alignment: "center",
              bold: true,
            },
            {},
            {},
            {},
            {},
          ],
          [
            "#",
            "Name",
            "Goals",
            "MVP",
            "Card",
            sepCell(),
            "#",
            "Name",
            "Goals",
            "MVP",
            "Card",
          ],
          ...createRosterTable(matchDetails),
        ],
      },
    },
    {
      margin: [0, 0, 0, 10],
      columns: [
        { text: "", width: "*" },
        {
          width: "auto",
          stack: [
            { text: "Score", alignment: "center" },
            {
              table: {
                widths: [50, 5, 50],
                headerRows: 0,
                body: [["", sepCell(), ""]],
                heights: 20,
              },
            },
          ],
        },
        { text: "", width: "*" },
      ],
    },
    {
      columns: [
        { text: "", width: "*" },
        {
          width: "auto",
          stack: [
            { text: "Penalty Shoot Out Score", alignment: "center" },
            {
              table: {
                widths: [50, 5, 50],
                headerRows: 0,
                body: [["", sepCell(), ""]],
                heights: 20,
              },
            },
          ],
        },
        { text: "", width: "*" },
      ],
      margin: [0, 0, 0, 30],
    },
    {
      columns: [
        {
          stack: [
            {
              text: "______________________",
            },
            {
              text: "Coach Signature",
            },
          ],
        },
        {
          stack: [
            {
              text: "______________________",
            },
            {
              text: "Referee Signature",
            },
          ],
          alignment: "center",
        },
        {
          stack: [
            {
              text: "______________________",
            },
            {
              text: "Coach Signature",
            },
          ],
          alignment: "right",
        },
      ],
    },
  ],
  styles: {
    header: {
      fontSize: 22,
      alignment: "center",
    },
    subtitle: {
      fontSize: 18,
      alignment: "center",
      italics: true,
    },
  },
};

var pdf = pdfMake.createPdf(docDefinition);

// write pdf to file
pdf.getBuffer((res) => {
  fs.writeFileSync("test.pdf", res);
});
