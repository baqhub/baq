import {IO} from "@baqhub/sdk";
import {describe, test} from "vitest";
import {MessageRecord} from "../baq/messageRecord.js";

describe("MessageRecord decoding", () => {
  test("text only", () => {
    // Prepare.
    const content = {
      conversation: {
        entity: "user.domain.com",
        record_id: "f028150b501f43a9b9135e2dd8c3416a",
      },
      text: "Hello!",
    };

    // Act + Assert.
    IO.decode(MessageRecord.RContent, content);
  });

  test("images only", () => {
    // Prepare.
    const content = {
      conversation: {
        entity: "user.domain.com",
        record_id: "f028150b501f43a9b9135e2dd8c3416a",
      },
      images: [
        {
          small: {
            hash: "fcb63519f623f729cccb7cddcde427331ff5da2274e02ebd52ecbd949c840b25",
            type: "image/jpeg",
            name: "ca43e_small.jpg",
          },
          medium: {
            hash: "4570bf268a3e94074365304640cd4a709ac65bb1d193898f7ad387822cbf7fab",
            type: "image/jpeg",
            name: "ca43e_medium.jpg",
          },
          large: {
            hash: "4805b783c0dad4053d74b33b634a1881461788b15e151d14987fe19e9d211660",
            type: "image/jpeg",
            name: "ca43e_large.jpg",
          },
          original: {
            hash: "340671d3431cc934f2416a27ac2f96ec452d6f939e37890bc77744f06d0aadcc",
            type: "image/jpeg",
            name: "ca43e_original.jpg",
          },
          original_size: 191658,
          original_width: 1179,
          original_height: 2556,
          value: 12,
        },
      ],
    };

    // Act + Assert.
    IO.decode(MessageRecord.RContent, content);
  });

  test("text and images", () => {
    // Prepare.
    const content = {
      conversation: {
        entity: "user.domain.com",
        record_id: "f028150b501f43a9b9135e2dd8c3416a",
      },
      text: "Hello!",
      images: [
        {
          small: {
            hash: "fcb63519f623f729cccb7cddcde427331ff5da2274e02ebd52ecbd949c840b25",
            type: "image/jpeg",
            name: "ca43e_small.jpg",
          },
          medium: {
            hash: "4570bf268a3e94074365304640cd4a709ac65bb1d193898f7ad387822cbf7fab",
            type: "image/jpeg",
            name: "ca43e_medium.jpg",
          },
          large: {
            hash: "4805b783c0dad4053d74b33b634a1881461788b15e151d14987fe19e9d211660",
            type: "image/jpeg",
            name: "ca43e_large.jpg",
          },
          original: {
            hash: "340671d3431cc934f2416a27ac2f96ec452d6f939e37890bc77744f06d0aadcc",
            type: "image/jpeg",
            name: "ca43e_original.jpg",
          },
          original_size: 191658,
          original_width: 1179,
          original_height: 2556,
        },
      ],
    };

    // Act + Assert.
    IO.decode(MessageRecord.RContent, content);
  });
});
