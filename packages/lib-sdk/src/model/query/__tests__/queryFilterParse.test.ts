import {describe, expect, test} from "vitest";
import {AnyRecord} from "../../records/record.js";
import {Q, QueryFilter} from "../queryFilter.js";
import {QueryLink} from "../queryLink.js";
import {QueryLinkValue} from "../queryLinkValue.js";

describe("filter parse", () => {
  const successPairs: ReadonlyArray<[string, QueryFilter<AnyRecord>]> = [
    // Entity link.
    [
      "entity.host.com",
      Q.link(QueryLink.link(QueryLinkValue.entity("entity.host.com"))),
    ],

    // Record link.
    [
      "entity.host.com+237d3e8518f64a7ea84397b32ba9182b",
      Q.link(
        QueryLink.link(
          QueryLinkValue.record({
            entity: "entity.host.com",
            recordId: "237d3e8518f64a7ea84397b32ba9182b",
          })
        )
      ),
    ],

    // Version link.
    [
      "entity.host.com+237d3e8518f64a7ea84397b32ba9182b+5218504fc52a48938e649debc1cadb2f43e05ffba9db4588bbe7b420603151e2",
      Q.link(
        QueryLink.link(
          QueryLinkValue.version({
            entity: "entity.host.com",
            recordId: "237d3e8518f64a7ea84397b32ba9182b",
            versionHash:
              "5218504fc52a48938e649debc1cadb2f43e05ffba9db4588bbe7b420603151e2",
          })
        )
      ),
    ],

    // Entity link AND record link.
    [
      "entity.host.com,entity.host.com+237d3e8518f64a7ea84397b32ba9182b",
      Q.and(
        Q.link(QueryLink.link(QueryLinkValue.entity("entity.host.com"))),
        Q.link(
          QueryLink.link(
            QueryLinkValue.record({
              entity: "entity.host.com",
              recordId: "237d3e8518f64a7ea84397b32ba9182b",
            })
          )
        )
      ),
    ],

    // Tag link.
    [`"hello"`, Q.link(QueryLink.link(QueryLinkValue.tag("hello")))],
    [`$['value']="hello"`, Q.tag("$['value']", "hello")],
    [
      `"hello",$['value']="hello"`,
      Q.and(
        Q.link(QueryLink.link(QueryLinkValue.tag("hello"))),
        Q.tag("value", "hello")
      ),
    ],

    // Empty link.
    ["$['value']=", Q.empty("value")],

    // Complex filter.
    [
      `$['value']="hello",($['author']=entity.host.com,"hello")`,
      Q.and(
        Q.tag("$['value']", "hello"),
        Q.or(
          Q.entity("author", "entity.host.com"),
          Q.link(QueryLink.link(QueryLinkValue.tag("hello")))
        )
      ),
    ],
  ];

  test.each(successPairs)("parsing filter %s", (filterString, filter) => {
    // Act.
    const actual = Q.ofString(filterString);

    // Assert.
    expect(actual).toEqual(filter);
  });
});
