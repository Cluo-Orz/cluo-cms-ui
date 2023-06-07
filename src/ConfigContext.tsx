// ConfigContext.js
import React, { createContext, useState, useEffect } from 'react';

export const configData = {
    host: '',
    dataPath: '',
    basePath: '',
    init: false,
    layout: 'AppTopSide',
    keyPath: {
        't1': ['t1'],
        's1': ['s1', 't1'],
        's11': ['s11', 's1', 't1'],
    },
    barInfo: [
        {
            defaultSubSideBar: 's11',
            defaultSubSideBarTitle: 'Loading',
            defaultSideBar: 's1',
            defaultSideBarTitle: 'Loading',
            topBar: {
                key: 't1',
                label: 'Loading',
            },
            sideBars: [
                {
                    key: 's1',
                    label: 'Loading',
                    icon: 'CreditCardOutlined',
                    children: [
                        {
                            key: 's11',
                            label: 'Loading',
                        },
                    ],
                },
            ]
        }
    ],
    defaultTopBar: 'k1',
    defaultTopBarTitle: 'Loading',
    defaultSubSideBar: 's11',
    defaultSubSideBarTitle: 'Loading',
    defaultSideBar: 's1',
    defaultSideBarTitle: 'Loading'
};

type ConfigType = typeof configData;

const ConfigContext = createContext<ConfigType>(configData);

const ConfigProvider = ({ children }: { children: any }) => {
    const [config, setConfig] = useState<ConfigType>(configData);

    useEffect(() => {
        if (!config.init) {
// 在组件加载时调用接口获取数据
            fetch('/cms-api/cms/initializing/public-info')
                .then((response) => response.json())
                .then((data) => setConfig(data))
                .catch((error) => console.error(error));
        }
    }, []);

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export { ConfigContext, ConfigProvider };