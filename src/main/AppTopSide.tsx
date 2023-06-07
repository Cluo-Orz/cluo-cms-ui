import React, {useContext, useState} from 'react';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { ConfigContext } from '../ConfigContext';
import {HomeOutlined} from '@ant-design/icons';
import * as AllIcon from '@ant-design/icons';
import axios from "axios";
import DynamicContentComponent from "./DynamicContent";

const { Header, Sider } = Layout;


const App: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();



    const config = useContext(ConfigContext);

    const [reloadContent, setReloadContent] = useState(Date.now())

    const [barData, setBarData] = useState({
        openedSideBarTitle: config.defaultSideBarTitle,
        openedSideBar: config.defaultSideBar,
        selectedSideBarTitle: config.defaultSideBarTitle,
        selectedSideBar: config.defaultSideBar,
        selectedTopBarTitle: config.defaultTopBarTitle,
        selectedTopBar: config.defaultTopBar,
        selectedSubSideBarTitle: config.defaultSubSideBarTitle,
        selectedSubSideBar: config.defaultSubSideBar
    });

    const [currentSideBar, setCurrentSideBar] = useState([
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
    ]);

    const [init, setInit] = useState(false);

    if(!init && config.init){
        setInit(true)
        setBarData({
            selectedTopBarTitle: config.defaultTopBarTitle,
            selectedTopBar: config.defaultTopBar,
            selectedSideBarTitle: config.defaultSideBarTitle,
            selectedSideBar: config.defaultSideBar,
            selectedSubSideBarTitle: config.defaultSubSideBarTitle,
            selectedSubSideBar: config.defaultSubSideBar,
            openedSideBarTitle: config.defaultSideBarTitle,
            openedSideBar: config.defaultSideBar,
        })
        setCurrentSideBar(config.barInfo.find(t => t.topBar.key===config.defaultTopBar)?.sideBars||[])
        setReloadContent(Date.now());
    }

    const onClickTopBar: MenuProps['onClick'] = (e) => {
        const barInfo = config.barInfo.find(t => t.topBar.key===e.key);
        if(!barInfo){
            return;
        }
        const it = barInfo.topBar;
        setBarData({...barData,...{
            selectedTopBar: e.key,
            selectedTopBarTitle:  it.label,
            selectedSideBarTitle: barInfo.defaultSideBarTitle,
            selectedSideBar: barInfo.defaultSideBar,
            selectedSubSideBarTitle: barInfo.defaultSubSideBarTitle,
            selectedSubSideBar: barInfo.defaultSubSideBar,
            openedSideBarTitle: barInfo.defaultSideBarTitle,
            openedSideBar: barInfo.defaultSideBar,
        }})
        setCurrentSideBar(barInfo.sideBars);
        setReloadContent(Date.now());
    };

    const onOpenChangeSideBar: MenuProps['onOpenChange'] = e=>{
        const sideKey = e[1];
        const side = currentSideBar.find(t => t.key===sideKey)
        if(side){
            setBarData({...barData,...{
                openedSideBar: side.key,
                openedSideBarTitle:  side.label
            }})
        }
    }

    const onClickSubSidebar: MenuProps['onClick'] = e=>{
        const subSideKey = e.keyPath[0]
        const sideKey= e.keyPath[1]

        if(barData.selectedSubSideBar === subSideKey){
            return;
        }
        const side = currentSideBar.find(t => t.key===sideKey)

        if(!side) {
            return
        }
        const subSide = side.children.find(t => t.key===subSideKey);
        if(!subSide){
            return;
        }
        setBarData({...barData,...{
            selectedSubSideBar: subSide.key,
            selectedSubSideBarTitle:  subSide.label,
            selectedSideBar: side.key,
            selectedSideBarTitle:  side.label,
            openedSideBar: side.key,
            openedSideBarTitle:  side.label
        }})

        setReloadContent(Date.now());
    }

    const items1: MenuProps['items'] = config.barInfo.map((item) => {
        return {
            key: item.topBar.key,
            label: item.topBar.label
        };
    });

    const items2: MenuProps['items'] = currentSideBar.map((item) => {
        return {
            key: item.key,
            label: item.label,
            // @ts-ignore
            icon: React.createElement(AllIcon[item.icon]),
            children: item.children
        };
    });

    return (
        <div>
            <Layout style={{height:"100vh"}}>
                <Header style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="demo-logo" />
                    <Menu
                        style={{ minWidth: 0, flex: "auto" }}
                        onClick={onClickTopBar}
                        theme="dark"
                        selectedKeys={[barData.selectedTopBar]}
                        mode="horizontal"
                        items={items1}
                    />
                </Header>
                <Layout>
                    <Sider width={200} style={{ background: colorBgContainer }}>
                        <Menu
                            mode="inline"
                            style={{ height: '100%', borderRight: 0 }}
                            onOpenChange={onOpenChangeSideBar}
                            openKeys={[barData.openedSideBar]}
                            selectedKeys={[barData.selectedSubSideBar]}
                            onClick={onClickSubSidebar}
                            items={items2}
                        />
                    </Sider>
                    <Layout style={{ padding: '0 24px 24px' }}>
                        <Breadcrumb
                            style={{
                                padding: 12,
                            }}
                            items={[
                                {
                                    title: <HomeOutlined />,
                                },
                                {
                                    title: barData.selectedTopBarTitle,
                                },
                                {
                                    title: barData.selectedSideBarTitle,
                                },
                                {
                                    title: barData.selectedSubSideBarTitle,
                                },
                            ]}
                        />
                        <DynamicContentComponent
                            parentReloadTag={reloadContent}
                            config={config}
                            barData={barData}
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: 280,
                                background: colorBgContainer,
                            }}
                        />
                    </Layout>
                </Layout>
            </Layout>
        </div>

    );
};

export default App;