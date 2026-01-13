import BaseFailure from "@/feature/common/failures/base.failure";
import aiLangKey, { aiLangNs } from "@/feature/common/lang-keys/ai.lang-key";

export default class AiServiceUnavailableFailure<
  META_DATA = undefined,
> extends BaseFailure<META_DATA> {
  constructor(metadata?: META_DATA) {
    super(aiLangKey.failure.serviceUnavailable, aiLangNs, metadata);
  }
}
