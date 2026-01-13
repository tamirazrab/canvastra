import BaseFailure from "@/feature/common/failures/base.failure";
import projectLangKey, {
  projectLangNs,
} from "@/feature/common/lang-keys/project.lang-key";

export default class ProjectNotFoundFailure<
  META_DATA = undefined,
> extends BaseFailure<META_DATA> {
  constructor(metadata?: META_DATA) {
    super(projectLangKey.failure.notFound, projectLangNs, metadata);
  }
}
