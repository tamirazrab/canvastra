import BaseFailure from "@/feature/common/failures/base.failure";
import subscriptionLangKey, {
  subscriptionLangNs,
} from "@/feature/common/lang-keys/subscription.lang-key";

export default class PaymentFailedFailure<
  META_DATA = undefined,
> extends BaseFailure<META_DATA> {
  constructor(metadata?: META_DATA) {
    super(
      subscriptionLangKey.failure.paymentFailed,
      subscriptionLangNs,
      metadata,
    );
  }
}
