// @ts-nocheck
// hehe lazy
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
import {
    Alert,
    Collapse,
    Divider,
    LinearProgress,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuList, Popover,
    TextField
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
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
import {useQuery} from "react-query";
import {deleteEntry, issueEntryCommand, list as listFiles} from "../../api/files";
import useEvent from "../../hooks/useEvent";
import {confirmDialog} from "../../utils/confirmDialog";
import create from "zustand";
import {useJobStateStore} from "../../state/jobState";
import {usePrinterStateStore} from "../../state/printerState";
import {styled, useTheme} from "@mui/material/styles";
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridRenderCellParams, GridRowParams,
    GridValueFormatterParams,
    GridValueGetterParams
} from "@mui/x-data-grid";

// File browser table heavily based on demos from https://next.material-ui.com/components/tables/
/*
 * TODOs here
 * ✓ API routes
 * ✓ View & sort by top level data: Name, Date, Size
 * ✓ Search box at top
 * ✓ Info button for more info on file
 * - Differentiate between files & folders
 * - Select/Print/Delete/Move toolbars
 * - Upload file button - maybe outside file manager?
 * - Create folders
 */

interface RequestActiveStore {
    active: boolean;
    on: () => void;
    off: () => void;
    set: (newState: boolean) => void;
}

const useRequestActiveStore = create<RequestActiveStore>(set => ({
    active: false,
    on: () => set({active: true}),
    off: () => set({active: false}),
    set: (newState) => set({active: newState})
}))

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

interface FileInformation {
    name: string;
    display: string;
    path: string;
    type: "model" | "machinecode" | "folder";
    typePath: [];
}

interface Folder extends FileInformation {
    children: Array<FileInformation | Folder>;
    size?: number;
}

interface File extends FileInformation{
    origin: "local" | "sdcard";
}

interface LocalFile extends File {
    hash: string;
    size: number;
    date: number;
    gcodeAnalysis?: object;
    prints?: object;
    statistics?: object;
}

interface SdCardFile extends File {
    size? : number;
}

interface EnhancedTableHeadProps {
    order: "asc" | "desc";
    orderBy: string;
    onRequestSort: (property: string) => void;
}

function EnhancedTableHead({order, orderBy, onRequestSort}: EnhancedTableHeadProps) {

    const createSortHandler = (property: string) => () => {
        onRequestSort(property);
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

interface EnhancedTableToolbarProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent) => void;
    onRefresh: () => void;
}

const EnhancedTableToolbar = ({searchTerm, onSearchChange, onRefresh}: EnhancedTableToolbarProps) => {
    const [sdAnchorEl, setSdAnchorEl] = React.useState<Element | null>(null)
    const sdMenuOpen = Boolean(sdAnchorEl)

    const handleSdClick = (e: React.MouseEvent) => {
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
                <IconButton onClick={onRefresh} size="large">
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

const LoadingPlaceholder = styled(Box)({
    height: "4px"
})

function Files({isActive}) {
    const [order, setOrder] = React.useState<"asc" | "desc">('asc');
    const [orderBy, setOrderBy] = React.useState<string>('filename');
    const [page, setPage] = React.useState(0);
    const [search, setSearch] = React.useState("")

    const isRequestActive = useRequestActiveStore(state => state.active)

    const rowsPerPage = 10

    const {isLoading, error, data, refetch} = useQuery("listFiles", () => listFiles(), {
        // Lazy loading the files list - uses cached results until active
        // Speed up initial load, don't send too many requests to the server.
        // TODO fix re-requesting on tab change - kinda important
        enabled: isActive,
    })

    const rows = data ? data.files : []

    const handleRequestSort = (property : string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
    };

    const handleSearchChange = (event: React.ChangeEvent) => {
        /* @ts-ignore */
        const value = event.target.value
        setSearch(value)
    }

    const handleRefresh = () => {
        refetch()
    }

    // On changes to files, refresh the list
    useEvent(() => {
        handleRefresh()
    }, ["UpdatedFiles"])

    const searchedRows = searchFilter(rows, search)

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - searchedRows.length) : 0;

    return (
        <Box>
            <NewFiles isActive={isActive} />
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

const FilesError = () => (
    <TableRow>
        <TableCell colspan={"6"}>
            <Alert severity={"error"}>
                There was an error fetching the file list. Please refresh the page, and if the issue persists please report it!
            </Alert>
        </TableCell>
    </TableRow>

)

interface FileViewProps {
    data: LocalFile | SdCardFile
}

function FileView({data}: FileViewProps){

    const Icon = "prints" in data ? (data.prints.success ? SuccessIcon : FailedIcon) : NeutralIcon

    const [open, setOpen] = React.useState(false)
    const setRequestActive = useRequestActiveStore(state => state.set)

    const currentFile = useJobStateStore(state => state.file)
    const printerReady = usePrinterStateStore(state => state.flags.ready)

    const selected = currentFile.name === data.name

    const handleSelect = (print=false) => {
        if (!printerReady) return
        setRequestActive(true)
        issueEntryCommand(data.origin, data.path, "select", {print: print}).then(() => setRequestActive(false))
    }

    const handleDelete = () => {
        confirmDialog("Confirm Delete", `You are about to delete ${data.display}`, doDelete)
    }

    const doDelete = () => {
        setRequestActive(true)
        deleteEntry(data.origin, data.path).then(() => setRequestActive(false))
    }

    // Selected table row = printing?
    return (
        <>
            <TableRow
                hover
                tabIndex={-1}
                key={data.display}
                sx={{minHeight: "46px", '& > td': { borderBottom: 'unset' }}}
                selected={selected}
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
                        <Box sx={{cursor: printerReady ? 'pointer' : 'inherit'}} onClick={() => handleSelect(false)}>
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
                    <IconButton size={"small"} onClick={() => handleSelect(true)} disabled={!printerReady}>
                        <PrintIcon />
                    </IconButton>
                    <IconButton size={"small"} onClick={() => handleDelete()}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton size={"small"}>
                        <FileMoveIcon />
                    </IconButton>
                    <IconButton size={"small"} component={Link} href={data.refs.download} >
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

interface FolderViewProps {
    data: Folder
}

function FolderView ({data}: FolderViewProps) {
    return (
        <TableRow
            hover
            tabIndex={-1}
            sx={{minHeight: "46px"}}
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


export default Files


function NewFiles ({isActive}) {
    const {active: requestActive, set: setRequestActive} = useRequestActiveStore()

    const {isLoading, error, data, refetch} = useQuery("listFiles", () => listFiles(), {
        enabled: isActive
    })

    const formattedRows = (data ? data.files : []).map((row, index) => ({...row, id: index}))

    const handleRefresh = () => {
        refetch()
    }

    useEvent(() => {
        if (isActive) {
            handleRefresh()
        }
    }, ["UpdatedFiles"])

    const printerReady = usePrinterStateStore(state => state.flags.ready)
    const currentFile = useJobStateStore(state => state.file)

    const handleSelect = React.useCallback( (fileData, print=false) => {
        if (!printerReady) {
            return
        }
        setRequestActive(true)
        issueEntryCommand(fileData.origin, fileData.path, "select", {print: print}).then(
            () => setRequestActive(false)
        )
    }, [printerReady, setRequestActive])

    const handleDelete = React.useCallback((fileData) => {
        confirmDialog("Confirm Delete", `You are about to delete ${fileData.display}`, () => {
            setRequestActive(true)
            deleteEntry(fileData.origin, fileData.path).then(
                () => setRequestActive(false)
            )
        })
    }, [setRequestActive])

    const gridCols: GridColDef[] = React.useMemo(() => ([
        {
            field: "status",
            flex: 0.1,
            editable: false,
            headerName: "",
            sortable: false,
            align: 'center',
            valueGetter: (params: GridValueGetterParams) => ("prints" in params.row ? (!!params.row.prints.success) : null),
            renderCell: (params: GridRenderCellParams) => (
                params.value === null ? <NeutralIcon /> : (params.value ? <SuccessIcon /> : <FailedIcon />)
            )
        },
        {
            field: "info",
            type: "actions",
            flex: 0.1,
            editable: false,
            headerName: "",
            sortable: false,
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <FileInfo data={params.row} />
            )
        },
        {
            field: "display",
            headerName: "Name",
            flex: 0.7,
            editable: false},
        {
            field: "date",
            headerName: "Uploaded",
            flex: 0.3,
            editable: false,
            valueFormatter: (params: GridValueFormatterParams) => (new Date(params.value * 1000).toLocaleDateString())
        },
        {
            field: "size",
            headerName: "Size",
            flex: 0.3,
            editable: false,
            valueFormatter: (params: GridValueFormatterParams) => fileSize(params.value)
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.3,
            editable: false,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    label={"print"}
                    icon={<PrintIcon />}
                    onClick={() => handleSelect(params.row, true)}
                />,
                <GridActionsCellItem
                    label={"Delete"}
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(params.row)}
                />,
                <GridActionsCellItem
                    label={"Move"}
                    icon={<FileMoveIcon />}
                />,
                <GridActionsCellItem
                    label={"Download"}
                    icon={<DownloadIcon />}
                    component={Link}
                    href={params.row.refs.download}
                />
            ]
        }
    ]), [handleSelect, handleDelete])

    const CustomToolbar = () => (
        <Toolbar>
            <Typography variant="h6" id="tableTitle" sx={{flex: '1 1 100%'}} component={"div"}>
                Files
            </Typography>
            <Box
                display={"flex"}
                justifyContent={'flex-end'}
                alignItems={'center'}
                sx={{"&> *": {mx: 1}}}
                width={'100%'}
            >
                <IconButton onClick={() => {}} size="large">
                    <SdCardIcon />
                </IconButton>
                <IconButton onClick={() => {}} size="large">
                    <CachedIcon />
                </IconButton>
                <TextField
                    value={""}
                    onChange={() => {}}
                    variant={"standard"}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon />
                        )
                    }}
                    sx={{ml: 2, mr: 1}}
                />
            </Box>
        </Toolbar>
    )



    return (
        <Box display={"flex"} minHeight={"500px"}>
            <DataGrid
                columns={gridCols}
                rows={formattedRows}
                autoHeight
                pageSize={10}
                rowsPerPageOptions={[]}
                disableColumnMenu
                disableSelectionOnClick={!printerReady}
                components={{
                    Toolbar: CustomToolbar
                }}
            />
        </Box>
    )
}


function FileInfo ({data}) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handlePopoverClose = () => {
        setAnchorEl(null);
    }

    const open = Boolean(anchorEl);

    // File Content stuff
    const hasAnalysis = data.gcodeAnalysis && !data.gcodeAnalysis.analysisPending
    const hasDimensions = (
        hasAnalysis
        && !data.gcodeAnalysis._empty
        && data.gcodeAnalysis.dimensions
        && data.gcodeAnalysis.dimensions.depth !== 0
        && data.gcodeAnalysis.dimensions.height !== 0
        && data.gcodeAnalysis.dimensions.width !== 0
    )
    const hasTimeEstimate = hasAnalysis  // Always available

    const hasFilament = (
        hasAnalysis
        && data.gcodeAnalysis.filament
        && typeof data.gcodeAnalysis.filament === "object"
    )

    const filament = data.gcodeAnalysis.filament
    let filamentStats
    if (Object.keys(filament).length === 1) {
        filamentStats = (
            <Typography variant={"body1"}>
                Filament: {formatFilament(filament)}
            </Typography>
        )
    }

    return (
        <>
            <IconButton
                onClick={handlePopoverOpen}
            >
                <InfoIcon
                    color={"info"}
                />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{m: 2}}>
                    <Typography variant={"body1"}>
                        {hasDimensions
                            ? `Model size: ${formatSize(data.gcodeAnalysis.dimensions)}`
                            : "Model has no extrusion"
                        }
                    </Typography>
                    <Typography variant={"body1"}>
                        {hasTimeEstimate
                            ? `Estimated print time: ${formatTime(data.gcodeAnalysis.estimatedPrintTime)}`
                            : "Estimated print time unavailable"
                        }
                    </Typography>
                    {hasFilament &&
                        <Typography variant={"body1"}>
                            {`Filament used: TODO...`}
                        </Typography>
                    }
                </Box>
            </Popover>
        </>
    )
}

const formatFilament = (filament) => {
    if (!filament || !filament["length"]) return "-"

    return (`${(filament["length"] / 1000).toFixed(2)}mm`)
}

