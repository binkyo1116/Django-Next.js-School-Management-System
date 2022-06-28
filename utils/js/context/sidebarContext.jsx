import { createContext, useState } from 'react';

const SidebarContext = createContext({
    open              : false,
    setOpen           : () => {},
    openedSubLists    : [],
    setOpenedSubLists : () => {},
    selected          : null,
    setSelected       : () => {},
});

export default SidebarContext;

export const SidebarProvider = ({ children }) => {
    const [ sidebarOpen, setSidebarOpen ] = useState(false);
    const [ openedSubLists, setOpenedSubLists ] = useState([]);
    const [ selectedItem, setSelectedItem ] = useState(null);

    const contextData = {
        open              : sidebarOpen,
        setOpen           : setSidebarOpen,
        openedSubLists    : openedSubLists,
        setOpenedSubLists : setOpenedSubLists,
        selected          : selectedItem,
        setSelected       : setSelectedItem,
    };

    return (
        <SidebarContext.Provider value={contextData}>
            {children}
        </SidebarContext.Provider>
    );
};
