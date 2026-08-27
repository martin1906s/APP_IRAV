import { registerRootComponent } from 'expo';
import App from './App';
import { registerIravWidgets } from './src/presentation/widgets/registerWidgets';

registerIravWidgets();
registerRootComponent(App);
