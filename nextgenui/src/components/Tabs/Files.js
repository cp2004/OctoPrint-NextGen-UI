import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import {Collapse, ListItemIcon, ListItemText, Menu, MenuList, TextField} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import CachedIcon from '@mui/icons-material/Cached';
import SdCardIcon from '@mui/icons-material/SdCard';
import EjectIcon from '@mui/icons-material/Eject';
import fileSize from "filesize";
import MenuItem from "@mui/material/MenuItem";
import PrintIcon from '@mui/icons-material/Print';
import FileMoveIcon from '@mui/icons-material/DriveFileMove';
import DownloadIcon from '@mui/icons-material/Download';
import TimerIcon from '@mui/icons-material/Timer';
import StraightenIcon from '@mui/icons-material/Straighten';
import FolderIcon from '@mui/icons-material/Folder';
import {visuallyHidden} from "@mui/utils";

// File browser table heavily based on demos from https://next.material-ui.com/components/tables/
/*
 * TODOs here
 * ✓ View & sort by top level data: Name, Date, Size
 * ✓ Search box at top
 * - Dropdown for more info on file
 * - Differentiate between files & folders
 * - Select/Print/Delete/Move toolbars
 * - Upload file button - maybe outside file manager?
 * - Create folders
 */

const headCells = [
    // Icons are 8% wide
    {
        id: 'display',
        numeric: false,
        disablePadding: true,
        label: 'Name',
        width: 40,  // Out of 100
        sort: true
    },
    {
        id: 'date',
        numeric: true,
        disablePadding: false,
        label: 'Uploaded',
        width: 15,
        sort: true
    },
    {
        id: 'size',
        numeric: true,
        disablePadding: false,
        label: 'Size',
        width: 15,
        sort: true
    },
    {
        id: 'actions',
        numeric: false,
        disablePadding: false,
        label: 'Actions',
        width: 20,
        sort: false
    },
];

function EnhancedTableHead(props) {
    const {order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell width={"3%"} />{/* Extra cell for icons */}
                <TableCell width={"3%"} />
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        width={headCell.width + "%"}
                    >
                        {headCell.sort
                            ? <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                            : headCell.label
                        }
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
};

// TODO none of the other components have titles
// TODO add search bar
const EnhancedTableToolbar = ({searchTerm, onSearchChange}) => {
    const [sdAnchorEl, setSdAnchorEl] = React.useState(false)
    const sdMenuOpen = Boolean(sdAnchorEl)

    const handleSdClick = (e) => {
        setSdAnchorEl(e.currentTarget)
    }

    const handleClose = () => {
        setSdAnchorEl(null)
    }

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                File Manager
            </Typography>
            <Box
                display={"flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
                sx={{"&> *": {mx: 1}}}
                width={"100%"}
            >
                <IconButton onClick={handleSdClick} size="large">
                    <SdCardIcon />
                </IconButton>
                <IconButton size="large">
                    <CachedIcon />
                </IconButton>
                <TextField
                    value={searchTerm}
                    onChange={onSearchChange}
                    variant={"standard"}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon />
                        )
                    }}
                    sx={{ml: 2, mr: 1}}
                />
                <Menu
                    anchorEl={sdAnchorEl}
                    open={sdMenuOpen}
                    onClose={handleClose}
                >
                    <MenuList>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <CachedIcon />
                            </ListItemIcon>
                            <ListItemText>
                                Refresh SD files
                            </ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <EjectIcon />
                            </ListItemIcon>
                            <ListItemText>
                                Release SD card
                            </ListItemText>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Toolbar>
    );
}

export default function Files() {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('filename');
    const [page, setPage] = React.useState(0);
    const [search, setSearch] = React.useState("")

    const rowsPerPage = 10
    const rows = SAMPLE_API.files

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value
        setSearch(value)
    }

    const searchedRows = searchFilter(rows, search)

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - searchedRows.length) : 0;

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar searchTerm={search} onSearchChange={handleSearchChange} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {stableSort(searchedRows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    if (row.type === "folder"){
                                        return <FolderView key={index} data={row} />
                                    } else {
                                        return <FileView key={index} data={row} />
                                    }
                                })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 42 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={searchedRows.length}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10]}
                    page={page}
                    onPageChange={handleChangePage}
                />
            </Paper>
        </Box>
    );
}

const SuccessIcon = () => (
    <CheckIcon color={"success"} />
)

const FailedIcon = () => (
    <CloseIcon color={"error"} />
)

const NeutralIcon = () => (
    <ViewInArIcon />
)

function FileView(props){
    const {data} = props

    let Icon
    if (data.prints) {
        Icon = data.prints.success ? SuccessIcon : FailedIcon
    } else {
        Icon = NeutralIcon
    }

    const [open, setOpen] = React.useState(false)

    // Selected table row = printing?
    return (
        <>
            <TableRow
                hover
                tabIndex={-1}
                key={data.display}
                sx={{'& > td': { borderBottom: 'unset' }}}
            >
                <TableCell>
                    <Icon />
                </TableCell>
                <TableCell padding={"none"}>
                    <IconButton
                        aria-label={"expand row"}
                        size={"small"}
                        onClick={() => setOpen(prevState => !prevState)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell padding={"none"} sx={{wordBreak: 'break-all', py: 1}}>
                    <Box display={"flex"} alignItems={"center"}>
                        <Box>
                            {data.display}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell align="right">
                    {(new Date(data.date * 1000)).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                    {fileSize(data.size)}
                </TableCell>
                <TableCell>
                    <IconButton size={"small"}>
                        <PrintIcon />
                    </IconButton>
                    <IconButton size={"small"}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton size={"small"}>
                        <FileMoveIcon />
                    </IconButton>
                    <IconButton size={"small"}>
                        <DownloadIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell sx={{py: 0}} colSpan={6}>
                    <Collapse in={open} timeout={"auto"} unmountOnExit>
                        <FileContent data={data} />
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

function FolderView ({data}) {
    return (
        <TableRow
            hover
            tabIndex={-1}
        >
            <TableCell>
                <FolderIcon />
            </TableCell>
            <TableCell colSpan={5}>
                {data.display}
            </TableCell>
        </TableRow>
    )
}

function FileContent({data}) {
    const hasAnalysis = data.gcodeAnalysis && !data.gcodeAnalysis.analysisPending
    const hasDimensions = (
        hasAnalysis
        && !data.gcodeAnalysis._empty
        && data.gcodeAnalysis.dimensions
        && data.gcodeAnalysis.dimensions.depth !== 0
        && data.gcodeAnalysis.dimensions.height !== 0
        && data.gcodeAnalysis.dimensions.width !== 0
    )
    const hasFilament = (
        hasAnalysis
        && data.gcodeAnalysis.filament
        && typeof data.gcodeAnalysis.filament === "object"
    )
    const hasTimeEstimate = hasAnalysis  // Always available
    const hasLastPrint = (
        data.prints
        && data.prints.last
    )

    // TODO fuzzy time durations
    // const fuzzyTimes = useSettings().appearance.fuzzyTimes

    return (
        <Box display={"flex"} flexDirection={"column"}>
            <FlexRow>
                <Tooltip title={"Model size"} placement={"bottom-start"}>
                    <StraightenIcon />
                </Tooltip>
                {hasDimensions
                    ? <span>Model Size: {formatSize(data.gcodeAnalysis.dimensions)}</span>
                    : <span>Model has no extrusion</span>
                }
                {hasTimeEstimate &&
                <>
                    <Tooltip title={"Estimated Print Time"} placement={"bottom-start"}>
                        <TimerIcon />
                    </Tooltip>
                    <span>{formatTime(data.gcodeAnalysis.estimatedPrintTime)}</span>
                </>}
            </FlexRow>
            {hasFilament &&
                <FlexRow>
                    <span>Filament: TODO </span>
                </FlexRow>
            }
            {hasLastPrint &&
                <>
                    <FlexRow>
                        <span>Last printed: {new Date(data.prints.last.date * 1000).toLocaleDateString()}</span>
                    </FlexRow>
                    {data.prints.last.printTime &&
                    <FlexRow>
                        <span>Last print time: {formatTime(data.prints.last.printTime)}</span>
                    </FlexRow>
                    }
                </>
            }
        </Box>
    )
}

const FlexRow = ({children}) => (
    <Box display={"flex"} alignItems={"center"} sx={{mb: 1, "&> * ": {mx: 1}}}>
        {children}
    </Box>
)

FileView.propTypes = {
    data: PropTypes.object.isRequired,
}

const formatSize = ({width, depth, height}) => {
    return `${width.toFixed(2)}mm x ${depth.toFixed(2)}mm x ${height.toFixed(2)}mm`
}

const formatTime = (seconds) => {
    // TODO support for fuzzy times too
    if (!seconds) return "-"
    if (seconds < 1) return "00:00:00"

    return (new Date(seconds * 1000)).toLocaleTimeString()
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function searchFilter(array, query) {
    query = query.toLocaleLowerCase()
    return array.filter((item) => item.name.includes(query) || item.display.includes(query))
}

const SAMPLE_API = JSON.parse('{\n' +
    '  "files": [\n' +
    '    {\n' +
    '      "date": 1608462643,\n' +
    '      "display": "20140205_Marvin_KeyChain(1)_0.3mm_PLA_MK3S_24m.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 117.377,\n' +
    '          "height": 25.4,\n' +
    '          "width": 136.932\n' +
    '        },\n' +
    '        "estimatedPrintTime": 1229.9118265919233,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 1117.002760000002,\n' +
    '            "volume": 2.686706493405014\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 136.932,\n' +
    '          "maxY": 114.377,\n' +
    '          "maxZ": 25.4,\n' +
    '          "minX": 0,\n' +
    '          "minY": -3,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "275ad8d331bc76a420761917516c64328e2e1e91",\n' +
    '      "name": "20140205_Marvin_KeyChain(1)_0.3mm_PLA_MK3S_24m.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "20140205_Marvin_KeyChain(1)_0.3mm_PLA_MK3S_24m.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/20140205_Marvin_KeyChain(1)_0.3mm_PLA_MK3S_24m.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/20140205_Marvin_KeyChain%281%29_0.3mm_PLA_MK3S_24m.gcode"\n' +
    '      },\n' +
    '      "size": 743567,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1618419019,\n' +
    '      "display": "4068-noinfill.aw.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 64.837,\n' +
    '          "height": 10.1,\n' +
    '          "width": 64.844\n' +
    '        },\n' +
    '        "estimatedPrintTime": 1273.6570293792533,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 1929.6551700000043,\n' +
    '            "volume": 4.641364606181957\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 142.422,\n' +
    '          "maxY": 142.418,\n' +
    '          "maxZ": 10.1,\n' +
    '          "minX": 77.578,\n' +
    '          "minY": 77.581,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "9673d5889d753fa42f26753d5928c7873954854b",\n' +
    '      "name": "4068-noinfill.aw.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "4068-noinfill.aw.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1623963560.7189777,\n' +
    '          "printTime": 135.5,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 4\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/4068-noinfill.aw.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/4068-noinfill.aw.gcode"\n' +
    '      },\n' +
    '      "size": 147661,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 137.80825000006007\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 135.5\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1618930347,\n' +
    '      "display": "4068-noinfill.aw (1).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 0.0379999999999967,\n' +
    '          "height": 1.1,\n' +
    '          "width": 0.046999999999997044\n' +
    '        },\n' +
    '        "estimatedPrintTime": 3.9710637790504633,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 165.54288,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 95.012,\n' +
    '          "maxY": 90.826,\n' +
    '          "maxZ": 1.1,\n' +
    '          "minX": 94.965,\n' +
    '          "minY": 90.788,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "cb6a91c84d4b2be3ab646191c6cb992a5b59deb4",\n' +
    '      "name": "4068-noinfill.aw_(1).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "4068-noinfill.aw_(1).gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/4068-noinfill.aw_(1).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/4068-noinfill.aw_%281%29.gcode"\n' +
    '      },\n' +
    '      "size": 606,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1623016235,\n' +
    '      "display": "4068-noinfill.aw (1) (1).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 6.8176733790836295,\n' +
    '          "height": 1.1,\n' +
    '          "width": 40.89542740004299\n' +
    '        },\n' +
    '        "estimatedPrintTime": 6.1551910634942555,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 170.80966,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 134.776427400043,\n' +
    '          "maxY": 92.043,\n' +
    '          "maxZ": 1.1,\n' +
    '          "minX": 93.881,\n' +
    '          "minY": 85.22532662091638,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "cb6a91c84d4b2be3ab646191c6cb992a5b59deb4",\n' +
    '      "name": "4068-noinfill.aw_(1)_(1).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "4068-noinfill.aw_(1)_(1).gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 0,\n' +
    '        "last": {\n' +
    '          "date": 1626948460.2646484,\n' +
    '          "printTime": 0.39000000001396984,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 1\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/4068-noinfill.aw_(1)_(1).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/4068-noinfill.aw_%281%29_%281%29.gcode"\n' +
    '      },\n' +
    '      "size": 606,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 0.39000000001396984\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 0.39000000001396984\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1615659040,\n' +
    '      "display": "40mmCube.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 47.60100000000001,\n' +
    '          "height": 41.59,\n' +
    '          "width": 47.60100000000001\n' +
    '        },\n' +
    '        "estimatedPrintTime": 3105.893618770675,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 8688.111399999998,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 128.8,\n' +
    '          "maxY": 128.8,\n' +
    '          "maxZ": 41.59,\n' +
    '          "minX": 81.199,\n' +
    '          "minY": 81.199,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "2383b762900c5bd8984daeab963ac56cc797bca9",\n' +
    '      "name": "40mmCube.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "40mmCube.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 22,\n' +
    '        "last": {\n' +
    '          "date": 1621792208.6852918,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/40mmCube.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/40mmCube.gcode"\n' +
    '      },\n' +
    '      "size": 349115,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1623086693,\n' +
    '      "display": "40mmCube (1).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 47.60100000000001,\n' +
    '          "height": 41.59,\n' +
    '          "width": 47.60100000000001\n' +
    '        },\n' +
    '        "estimatedPrintTime": 3105.893618770675,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 8688.111399999998,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 128.8,\n' +
    '          "maxY": 128.8,\n' +
    '          "maxZ": 41.59,\n' +
    '          "minX": 81.199,\n' +
    '          "minY": 81.199,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "2383b762900c5bd8984daeab963ac56cc797bca9",\n' +
    '      "name": "40mmCube_(1).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "40mmCube_(1).gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1623963367.447407,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/40mmCube_(1).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/40mmCube_%281%29.gcode"\n' +
    '      },\n' +
    '      "size": 349115,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1600538218,\n' +
    '      "display": "8x chain piece.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 60.02499999999999,\n' +
    '          "height": 13,\n' +
    '          "width": 106.906\n' +
    '        },\n' +
    '        "estimatedPrintTime": 6362.1363306277,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 5369.52968000036,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 188.453,\n' +
    '          "maxY": 142.498,\n' +
    '          "maxZ": 13.2,\n' +
    '          "minX": 81.547,\n' +
    '          "minY": 82.473,\n' +
    '          "minZ": 0.2\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "0e94330b1a0bf4605b2b89c4da7b7db95f1a3160",\n' +
    '      "name": "8x_chain_piece.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "8x_chain_piece.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 3,\n' +
    '        "last": {\n' +
    '          "date": 1604617866.084,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/8x_chain_piece.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/8x_chain_piece.gcode"\n' +
    '      },\n' +
    '      "size": 3577142,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1615658639,\n' +
    '      "display": "bauble-wavy.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 70.40899999999999,\n' +
    '          "height": 81.9,\n' +
    '          "width": 69.75600000000001\n' +
    '        },\n' +
    '        "estimatedPrintTime": 7809.077432855496,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 7111.860559999937,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 144.901,\n' +
    '          "maxY": 145.196,\n' +
    '          "maxZ": 81.9,\n' +
    '          "minX": 75.145,\n' +
    '          "minY": 74.787,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "bca7ccee03fa6d38bfb296428a482f66009ed0c6",\n' +
    '      "name": "bauble-wavy.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "bauble-wavy.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/bauble-wavy.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/bauble-wavy.gcode"\n' +
    '      },\n' +
    '      "size": 10185106,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1619994802,\n' +
    '      "display": "Black_PETG.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 180,\n' +
    '          "height": 24.92,\n' +
    '          "width": 182.901\n' +
    '        },\n' +
    '        "estimatedPrintTime": 10945.612906901455,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 17659.579810006355,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 183.001,\n' +
    '          "maxY": 200,\n' +
    '          "maxZ": 24.92,\n' +
    '          "minX": 0.1,\n' +
    '          "minY": 20,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "5a9d664a9c253d77f4674fd01568846aa38c4222",\n' +
    '      "name": "Black_PETG.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Black_PETG.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1623086660.187867,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Black_PETG.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Black_PETG.gcode"\n' +
    '      },\n' +
    '      "size": 11366270,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1621025866,\n' +
    '      "display": "CE3_xyzCalibration_cube.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 180,\n' +
    '          "height": 20,\n' +
    '          "width": 138.4\n' +
    '        },\n' +
    '        "estimatedPrintTime": 1640.5046800877926,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 1716.5722699999858,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 138.5,\n' +
    '          "maxY": 200,\n' +
    '          "maxZ": 20,\n' +
    '          "minX": 0.1,\n' +
    '          "minY": 20,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "95a3cdbe84bbe9727c7c0622d204e5e6922bf3f7",\n' +
    '      "name": "CE3_xyzCalibration_cube.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "CE3_xyzCalibration_cube.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1621369800.5188134,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/CE3_xyzCalibration_cube.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/CE3_xyzCalibration_cube.gcode"\n' +
    '      },\n' +
    '      "size": 1862165,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1600034010,\n' +
    '      "display": "CFFFP_tower.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 79.96600000000001,\n' +
    '          "height": 147.875,\n' +
    '          "width": 50.974999999999994\n' +
    '        },\n' +
    '        "estimatedPrintTime": 13610.123997106122,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 16488.478719997518,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 135.487,\n' +
    '          "maxY": 149.983,\n' +
    '          "maxZ": 148.235,\n' +
    '          "minX": 84.512,\n' +
    '          "minY": 70.017,\n' +
    '          "minZ": 0.36\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "c5e8d892da33a942ce12a02783ea98e5165f7123",\n' +
    '      "name": "CFFFP_tower.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "CFFFP_tower.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 7,\n' +
    '        "last": {\n' +
    '          "date": 1617036838.1430788,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/CFFFP_tower.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/CFFFP_tower.gcode"\n' +
    '      },\n' +
    '      "size": 14309576,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1617023061,\n' +
    '      "display": "Connection_Test.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "estimatedPrintTime": 24.410726537279384,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 0,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": null,\n' +
    '          "maxY": null,\n' +
    '          "maxZ": null,\n' +
    '          "minX": null,\n' +
    '          "minY": null,\n' +
    '          "minZ": null\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "229489874f5ecfc60302d2e8157746f66b34dd3e",\n' +
    '      "name": "Connection_Test.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Connection_Test.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Connection_Test.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Connection_Test.gcode"\n' +
    '      },\n' +
    '      "size": 13520,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "DisplayLayerProgress": {\n' +
    '        "totalLayerCountWithoutOffset": "285"\n' +
    '      },\n' +
    '      "date": 1623249993,\n' +
    '      "display": "Desk Drawer.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 180,\n' +
    '          "height": 28.6,\n' +
    '          "width": 185.738\n' +
    '        },\n' +
    '        "estimatedPrintTime": 107906.47895241299,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 23673.597020004927,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 185.838,\n' +
    '          "maxY": 200,\n' +
    '          "maxZ": 28.6,\n' +
    '          "minX": 0.1,\n' +
    '          "minY": 20,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "dc7a3c2ffa4bc2014366382e179e7a3422e9f5d8",\n' +
    '      "name": "Desk_Drawer.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Desk_Drawer.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1623252660.8890183,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 0\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Desk_Drawer.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Desk_Drawer.gcode"\n' +
    '      },\n' +
    '      "size": 1652065,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {},\n' +
    '        "lastPrintTime": {}\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1607534714,\n' +
    '      "display": "Display Adapter - PETG Hevo.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 170.362,\n' +
    '          "height": 36.669999999999995,\n' +
    '          "width": 158.863\n' +
    '        },\n' +
    '        "estimatedPrintTime": 6483.695243073023,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 15323.631400000038,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 158.863,\n' +
    '          "maxY": 170.362,\n' +
    '          "maxZ": 36.87,\n' +
    '          "minX": 0,\n' +
    '          "minY": 0,\n' +
    '          "minZ": 0.2\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "3e63683680a74394233e8d7041bfb2793adeb0ff",\n' +
    '      "name": "Display_Adapter_-_PETG_Hevo.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Display_Adapter_-_PETG_Hevo.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Display_Adapter_-_PETG_Hevo.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Display_Adapter_-_PETG_Hevo.gcode"\n' +
    '      },\n' +
    '      "size": 2943904,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1615659074,\n' +
    '      "display": "e2e-test.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 0,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": null,\n' +
    '          "maxY": null,\n' +
    '          "maxZ": null,\n' +
    '          "minX": null,\n' +
    '          "minY": null,\n' +
    '          "minZ": null\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "73ceee3bd869315aac303be942894b41cd834606",\n' +
    '      "name": "e2e-test.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "e2e-test.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/e2e-test.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/e2e-test.gcode"\n' +
    '      },\n' +
    '      "size": 73,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1618165118,\n' +
    '      "display": "froggy-pot.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 143.328,\n' +
    '          "height": 143.4,\n' +
    '          "width": 136.185\n' +
    '        },\n' +
    '        "estimatedPrintTime": 75625.77723292091,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 46984.156280000105,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 223.09,\n' +
    '          "maxY": 231.632,\n' +
    '          "maxZ": 143.4,\n' +
    '          "minX": 86.905,\n' +
    '          "minY": 88.304,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "85770a01e6cfbf8f24efb77ad7a4462107864301",\n' +
    '      "name": "froggy-pot.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "froggy-pot.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/froggy-pot.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/froggy-pot.gcode"\n' +
    '      },\n' +
    '      "size": 75583038,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1620477350,\n' +
    '      "display": "Heating and cooling test.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "_empty": true,\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {},\n' +
    '        "printingArea": {\n' +
    '          "maxX": 0,\n' +
    '          "maxY": 0,\n' +
    '          "maxZ": 0,\n' +
    '          "minX": 0,\n' +
    '          "minY": 0,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "c9153f4044bb5bf8212e27d78bf4ddaad6933884",\n' +
    '      "name": "Heating_and_cooling_test.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Heating_and_cooling_test.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 0,\n' +
    '        "last": {\n' +
    '          "date": 1623255746.2187963,\n' +
    '          "printTime": 23.34299999999348,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 16\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Heating_and_cooling_test.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Heating_and_cooling_test.gcode"\n' +
    '      },\n' +
    '      "size": 97,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 23.327124999981606\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 23.34299999999348\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1621011071,\n' +
    '      "display": "Heating and cooling test (bed only).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "_empty": true,\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {},\n' +
    '        "printingArea": {\n' +
    '          "maxX": 0,\n' +
    '          "maxY": 0,\n' +
    '          "maxZ": 0,\n' +
    '          "minX": 0,\n' +
    '          "minY": 0,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "8e196a4891592b5f9005126b7d1a719c1f678d1c",\n' +
    '      "name": "Heating_and_cooling_test_(bed_only).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Heating_and_cooling_test_(bed_only).gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 0,\n' +
    '        "last": {\n' +
    '          "date": 1621808975.6503785,\n' +
    '          "printTime": 4.172000000020489,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 3\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Heating_and_cooling_test_(bed_only).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Heating_and_cooling_test_%28bed_only%29.gcode"\n' +
    '      },\n' +
    '      "size": 99,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 4.17699999998634\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 4.172000000020489\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1621011068,\n' +
    '      "display": "Heating and cooling test (tool only).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "_empty": true,\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {},\n' +
    '        "printingArea": {\n' +
    '          "maxX": 0,\n' +
    '          "maxY": 0,\n' +
    '          "maxZ": 0,\n' +
    '          "minX": 0,\n' +
    '          "minY": 0,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "577838496b98f1e0447e2cd5251aa05f6410b5d4",\n' +
    '      "name": "Heating_and_cooling_test_(tool_only).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Heating_and_cooling_test_(tool_only).gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 0,\n' +
    '        "last": {\n' +
    '          "date": 1621808583.161221,\n' +
    '          "printTime": 19.20299999997951,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 1\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Heating_and_cooling_test_(tool_only).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Heating_and_cooling_test_%28tool_only%29.gcode"\n' +
    '      },\n' +
    '      "size": 99,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 19.20299999997951\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 19.20299999997951\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1618326997,\n' +
    '      "display": "issue4068debug.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 144.02999999999997,\n' +
    '          "height": 168.8,\n' +
    '          "width": 99.209\n' +
    '        },\n' +
    '        "estimatedPrintTime": 54934.36887972429,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 69105.39640999967,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 194.72,\n' +
    '          "maxY": 258.707,\n' +
    '          "maxZ": 168.8,\n' +
    '          "minX": 95.511,\n' +
    '          "minY": 114.677,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "d08eb1f99b2b8817232896bee4163df38c360317",\n' +
    '      "name": "issue4068debug.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "issue4068debug.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/issue4068debug.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/issue4068debug.gcode"\n' +
    '      },\n' +
    '      "size": 97811323,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "children": [],\n' +
    '      "display": "M503 Debug",\n' +
    '      "name": "M503_Debug",\n' +
    '      "origin": "local",\n' +
    '      "path": "M503_Debug",\n' +
    '      "refs": {\n' +
    '        "resource": "http://localhost:5000/api/files/local/M503_Debug"\n' +
    '      },\n' +
    '      "size": 6319,\n' +
    '      "type": "folder",\n' +
    '      "typePath": [\n' +
    '        "folder"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1620422346,\n' +
    '      "display": "Nut (2).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 23.27799999999999,\n' +
    '          "height": 10,\n' +
    '          "width": 23.27799999999999\n' +
    '        },\n' +
    '        "estimatedPrintTime": 604.3541325803479,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 648.5757600000055,\n' +
    '            "volume": 1.5600075203548323\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 119.139,\n' +
    '          "maxY": 119.139,\n' +
    '          "maxZ": 10,\n' +
    '          "minX": 95.861,\n' +
    '          "minY": 95.861,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "124c2711d3783049d6a78488619831c054686272",\n' +
    '      "name": "Nut_(2).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "Nut_(2).gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/Nut_(2).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/Nut_%282%29.gcode"\n' +
    '      },\n' +
    '      "size": 2103458,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1627747954,\n' +
    '      "display": "print-002.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "_empty": true,\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {},\n' +
    '        "printingArea": {\n' +
    '          "maxX": 0,\n' +
    '          "maxY": 0,\n' +
    '          "maxZ": 0,\n' +
    '          "minX": 0,\n' +
    '          "minY": 0,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "9245829b12e305e2d68ab4d451ac34eb34781fa3",\n' +
    '      "name": "print-002.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "print-002.gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/print-002.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/print-002.gcode"\n' +
    '      },\n' +
    '      "size": 3412,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1603396487,\n' +
    '      "display": "spiral launcher full toy (4blade80mm).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 190.966,\n' +
    '          "height": 23.8,\n' +
    '          "width": 104.34700000000001\n' +
    '        },\n' +
    '        "estimatedPrintTime": 11288.359842666592,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 5680.682469999746,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 156.931,\n' +
    '          "maxY": 207.958,\n' +
    '          "maxZ": 24,\n' +
    '          "minX": 52.584,\n' +
    '          "minY": 16.992,\n' +
    '          "minZ": 0.2\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "4f47abce0e7d65350ea0bab9b5cf341a3622450e",\n' +
    '      "name": "spiral_launcher_full_toy_(4blade80mm).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "spiral_launcher_full_toy_(4blade80mm).gcode",\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/spiral_launcher_full_toy_(4blade80mm).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/spiral_launcher_full_toy_%284blade80mm%29.gcode"\n' +
    '      },\n' +
    '      "size": 19566021,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "children": [],\n' +
    '      "display": "test",\n' +
    '      "name": "test",\n' +
    '      "origin": "local",\n' +
    '      "path": "test",\n' +
    '      "refs": {\n' +
    '        "resource": "http://localhost:5000/api/files/local/test"\n' +
    '      },\n' +
    '      "size": 2943904,\n' +
    '      "type": "folder",\n' +
    '      "typePath": [\n' +
    '        "folder"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1616704742,\n' +
    '      "display": "virtual_level_report_cartesian.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 0,\n' +
    '          "height": 0,\n' +
    '          "width": 0\n' +
    '        },\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 0,\n' +
    '            "volume": 0\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": null,\n' +
    '          "maxY": null,\n' +
    '          "maxZ": null,\n' +
    '          "minX": null,\n' +
    '          "minY": null,\n' +
    '          "minZ": null\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "aca7434b66214211140782851ebbe62c49db973c",\n' +
    '      "name": "virtual_level_report_cartesian.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "virtual_level_report_cartesian.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 0,\n' +
    '        "last": {\n' +
    '          "date": 1617467969.8286366,\n' +
    '          "printTime": 0.0940000000409782,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 4\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/virtual_level_report_cartesian.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/virtual_level_report_cartesian.gcode"\n' +
    '      },\n' +
    '      "size": 848,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 0.0935000000463333\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 0.0940000000409782\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1625002964,\n' +
    '      "display": "xyzCalibration_cube.gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 36.254000000000005,\n' +
    '          "height": 20.1,\n' +
    '          "width": 36.25399999999999\n' +
    '        },\n' +
    '        "estimatedPrintTime": 1131.4520365593585,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 1548.8770400000074,\n' +
    '            "volume": 3.7254858715424755\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 128.134,\n' +
    '          "maxY": 128.12,\n' +
    '          "maxZ": 20.1,\n' +
    '          "minX": 91.88,\n' +
    '          "minY": 91.866,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "e4051ee51877fd61b58caa5aea7fda8165397fb9",\n' +
    '      "name": "xyzCalibration_cube.gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "xyzCalibration_cube.gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 6,\n' +
    '        "last": {\n' +
    '          "date": 1626948403.6357589,\n' +
    '          "printTime": 197.28099999995902,\n' +
    '          "success": true\n' +
    '        },\n' +
    '        "success": 8\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/xyzCalibration_cube.gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/xyzCalibration_cube.gcode"\n' +
    '      },\n' +
    '      "size": 304310,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 191.1191249999829\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 197.28099999995902\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "date": 1621800871,\n' +
    '      "display": "xyzCalibration_cube (1).gcode",\n' +
    '      "gcodeAnalysis": {\n' +
    '        "dimensions": {\n' +
    '          "depth": 36.254000000000005,\n' +
    '          "height": 20.1,\n' +
    '          "width": 36.25399999999999\n' +
    '        },\n' +
    '        "estimatedPrintTime": 1131.4520365593585,\n' +
    '        "filament": {\n' +
    '          "tool0": {\n' +
    '            "length": 1548.8770400000074,\n' +
    '            "volume": 3.7254858715424755\n' +
    '          }\n' +
    '        },\n' +
    '        "printingArea": {\n' +
    '          "maxX": 128.134,\n' +
    '          "maxY": 128.12,\n' +
    '          "maxZ": 20.1,\n' +
    '          "minX": 91.88,\n' +
    '          "minY": 91.866,\n' +
    '          "minZ": 0\n' +
    '        }\n' +
    '      },\n' +
    '      "hash": "e4051ee51877fd61b58caa5aea7fda8165397fb9",\n' +
    '      "name": "xyzCalibration_cube_(1).gcode",\n' +
    '      "origin": "local",\n' +
    '      "path": "xyzCalibration_cube_(1).gcode",\n' +
    '      "prints": {\n' +
    '        "failure": 1,\n' +
    '        "last": {\n' +
    '          "date": 1621802589.7140353,\n' +
    '          "success": false\n' +
    '        },\n' +
    '        "success": 1\n' +
    '      },\n' +
    '      "refs": {\n' +
    '        "download": "http://localhost:5000/downloads/files/local/xyzCalibration_cube_(1).gcode",\n' +
    '        "resource": "http://localhost:5000/api/files/local/xyzCalibration_cube_%281%29.gcode"\n' +
    '      },\n' +
    '      "size": 304310,\n' +
    '      "statistics": {\n' +
    '        "averagePrintTime": {\n' +
    '          "_default": 198.23400000017136\n' +
    '        },\n' +
    '        "lastPrintTime": {\n' +
    '          "_default": 198.23400000017136\n' +
    '        }\n' +
    '      },\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "display": "print--1.gco",\n' +
    '      "name": "print--1.gco",\n' +
    '      "origin": "sdcard",\n' +
    '      "path": "print--1.gco",\n' +
    '      "refs": {\n' +
    '        "resource": "http://localhost:5000/api/files/sdcard/print--1.gco"\n' +
    '      },\n' +
    '      "size": 235,\n' +
    '      "type": "machinecode",\n' +
    '      "typePath": [\n' +
    '        "machinecode",\n' +
    '        "gcode"\n' +
    '      ]\n' +
    '    }\n' +
    '  ],\n' +
    '  "free": 134507933696,\n' +
    '  "total": 511223648256\n' +
    '}')
