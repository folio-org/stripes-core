import {
  interactor,
  text,
} from '@bigtest/interactor';

export default @interactor
class NamespaceInteractor {
  name = text('#module-namespace');
}
