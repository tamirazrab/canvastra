import BaseFailure from "@/feature/common/failures/base.failure";
import projectLangKey, {
  projectLangNs,
} from "@/feature/common/lang-keys/project.lang-key";

export default class ProjectUnauthorizedFailure<
  META_DATA = undefined,
> extends BaseFailure<META_DATA> {
  constructor(metadata?: META_DATA) {
    super(projectLangKey.failure.unauthorized, projectLangNs, metadata);
  }
}
