import ThermostatIcon from "@material-ui/icons/Thermostat";
import ControlCameraIcon from "@material-ui/icons/ControlCamera";
import FolderOpenOutlinedIcon from "@material-ui/icons/FolderOpenOutlined";
import ChatOutlinedIcon from "@material-ui/icons/ChatOutlined";
import VideoOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import SettingsIcon from "@material-ui/icons/Settings";
import Temperature from "./Tabs/Temperature";
import Control from "./Tabs/Control";
import Files from "./Tabs/Files";
import Terminal from "./Tabs/Terminal";
import Timelapse from "./Tabs/Timelapse";
import Settings from "./Tabs/Settings";

const tabs = [
    {
        icon: ThermostatIcon,
        title: 'Temperature',
        tab: Temperature
    },
    {
        icon: ControlCameraIcon,
        title: 'Control',
        tab: Control,
    },
    {
        icon: FolderOpenOutlinedIcon,
        title: 'Files',
        tab: Files
    },
    {
        icon: ChatOutlinedIcon,
        title: 'Terminal',
        tab: Terminal
    },
    {
        icon: VideoOutlinedIcon,
        title: 'Timelapse',
        tab: Timelapse
    },
    {
        icon: SettingsIcon,
        title: 'Settings',
        tab: Settings,
    },
]

export default tabs;
