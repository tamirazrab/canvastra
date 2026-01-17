import CustomerRepo, {
  customerRepoKey,
} from "@/feature/core/customer/domain/i-repo/customer-repo";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { faker } from "@faker-js/faker";
import CustomerFakeFactory from "@/test/common/fake-factory/customer/customer.fake-factory";
import fetchCustomersUsecase from "@/feature/core/customer/domain/usecase/fetch-customers-usecase";
import { right } from "fp-ts/lib/TaskEither";
import { customerKey } from "@/feature/core/customer/customer-key";
import * as featuresDi from "@/feature/common/features.di";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedCustomerList = CustomerFakeFactory.getFakeCustomerList();
/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const MockedRepo = getMock<CustomerRepo>();
// fetchList returns ApiTask<Customer[]> which is TaskEither, so we return right(fakedCustomerList)
MockedRepo.setup((instance) => instance.fetchList)
  .returns(() => right(fakedCustomerList));

// Mock diResolve to return our mocked repository
vi.spyOn(featuresDi, "diResolve").mockImplementation((module, key) => {
  if (module === customerKey && key === customerRepoKey) {
    return MockedRepo.object() as unknown;
  }
  throw new Error(`Unexpected diResolve call: ${module}, ${String(key)}`);
});
/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
describe("Fetch customers", () => {
  describe("On given query string", () => {
    const fakedQuery = faker.person.fullName();
    describe("And returning list from repo", () => {
      it("Then should return correct list of customers", async () => {
        // ! Act
        const response = await fetchCustomersUsecase(fakedQuery);
        // ? Assert
        // The usecase returns ApiEither, so we need to extract the right value
        if (response._tag === "Right") {
          expect(response.right).toEqual(fakedCustomerList);
        } else {
          throw new Error(`Expected Right but got Left: ${JSON.stringify(response.left)}`);
        }
      });
    });
  });
});
