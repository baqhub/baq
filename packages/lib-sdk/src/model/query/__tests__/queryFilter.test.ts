import {describe, expect, test} from "@jest/globals";
import {Q, QueryFilter} from "../queryFilter.js";

describe("filter superset", () => {
  test("single source pass", () => {
    // Prepare.
    const filter = Q.source("notification");

    // Act.
    const result = QueryFilter.isSuperset(filter, filter);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("single source fail", () => {
    // Prepare.
    const filter1 = Q.source("notification");
    const filter2 = Q.source("resolution");

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("single link pass", () => {
    // Prepare.
    const filter = Q.author("test.entity.com");

    // Act.
    const result = QueryFilter.isSuperset(filter, filter);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("single link fail", () => {
    // Prepare.
    const filter1 = Q.author("test1.entity.com");
    const filter2 = Q.author("test2.entity.com");

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("simple OR pass", () => {
    // Prepare.
    const authorFilter = Q.author("test.entity.com");
    const filter1 = Q.or(Q.source("self"), authorFilter);
    const filter2 = authorFilter;

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("simple OR fail", () => {
    // Prepare.
    const authorFilter = Q.author("test.entity.com");
    const filter1 = authorFilter;
    const filter2 = Q.or(Q.source("self"), authorFilter);

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("simple AND pass", () => {
    // Prepare.
    const authorFilter = Q.author("test.entity.com");
    const filter1 = authorFilter;
    const filter2 = Q.and(Q.source("self"), authorFilter);

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("simple AND fail", () => {
    // Prepare.
    const authorFilter = Q.author("test.entity.com");
    const filter1 = Q.and(Q.source("self"), authorFilter);
    const filter2 = authorFilter;

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("simple AND+OR pass", () => {
    // Prepare.
    const author1Filter = Q.author("test1.entity.com");
    const author2Filter = Q.author("test2.entity.com");
    const filter1 = Q.and(Q.or(author1Filter, author2Filter), Q.source("self"));
    const filter2 = Q.and(author1Filter, Q.source("self"));

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("simple AND+OR fail", () => {
    // Prepare.
    const author1Filter = Q.author("test1.entity.com");
    const author2Filter = Q.author("test2.entity.com");
    const filter1 = Q.and(author1Filter, Q.source("self"));
    const filter2 = Q.and(Q.or(author1Filter, author2Filter), Q.source("self"));

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("both empty AND pass", () => {
    // Prepare.
    const filter = Q.and();

    // Act.
    const result = QueryFilter.isSuperset(filter, filter);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("empty AND pass", () => {
    // Prepare.
    const filter1 = Q.and();
    const filter2 = Q.source("self");

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("empty AND fail", () => {
    // Prepare.
    const filter1 = Q.source("self");
    const filter2 = Q.and();

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });

  test("both empty OR pass", () => {
    // Prepare.
    const filter = Q.or();

    // Act.
    const result = QueryFilter.isSuperset(filter, filter);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("empty OR pass", () => {
    // Prepare.
    const filter1 = Q.or();
    const filter2 = Q.source("self");

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeTruthy();
  });

  test("empty OR fail", () => {
    // Prepare.
    const filter1 = Q.source("self");
    const filter2 = Q.or();

    // Act.
    const result = QueryFilter.isSuperset(filter1, filter2);

    // Assert.
    expect(result).toBeFalsy();
  });
});
