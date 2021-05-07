import {
  interactor,
  isPresent,
  text,
} from '@bigtest/interactor';

export default @interactor
class ModuleHierarchyInteractor {
  names = text('#module-hierarchy');
}
