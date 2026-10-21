import type {CapacitorConfig} from '@capacitor/cli';
const demo=process.env.IRIS_DEMO==='true';
const config:CapacitorConfig={appId:demo?'co.iris.erp.sqlite.demo':'co.iris.erp.sqlite',appName:demo?'Iris ERP Demo':'Iris ERP SQLite',webDir:'dist'};
export default config;
