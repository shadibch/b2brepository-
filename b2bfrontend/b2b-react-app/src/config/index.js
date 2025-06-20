import * as devConfig from './development';
import * as prodConfig from './production';

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export const { API_BASE_URL, DEFAULT_IMAGE, ENV } = config; 