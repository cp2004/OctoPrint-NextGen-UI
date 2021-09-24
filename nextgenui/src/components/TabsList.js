import ThermostatIcon from "@mui/icons-material/Thermostat";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import VideoOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
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
        tab: Temperature,
        id: "temperature"
    },
    {
        icon: ControlCameraIcon,
        title: 'Control',
        tab: Control,
        id: "control"
    },
    {
        icon: FolderOpenOutlinedIcon,
        title: 'Files',
        tab: Files,
        id: "files",
    },
    {
        icon: ChatOutlinedIcon,
        title: 'Terminal',
        tab: Terminal,
        id: "terminal"
    },
    {
        icon: VideoOutlinedIcon,
        title: 'Timelapse',
        tab: Timelapse,
        id: "timelapse"
    },
    {
        icon: SettingsIcon,
        title: 'Settings',
        tab: Settings,
        id: "settings"
    },
]

export default tabs;
