// @ts-nocheck
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
import {useQuery} from "react-query";
import {list as listFiles} from "../../api/files";

// File browser table heavily based on demos from https://next.material-ui.com/components/tables/
/*
 * TODOs here
 * - API routes
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
}

const EnhancedTableToolbar = ({searchTerm, onSearchChange}: EnhancedTableToolbarProps) => {
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
    const [order, setOrder] = React.useState<"asc" | "desc">('asc');
    const [orderBy, setOrderBy] = React.useState<string>('filename');
    const [page, setPage] = React.useState(0);
    const [search, setSearch] = React.useState("")

    const rowsPerPage = 10

    const {isLoading, error, data, refetch} = useQuery("listFiles", () => {
        return listFiles()
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
                                .map((row: LocalFile | SdCardFile | Folder, index: number) => {
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

interface FileViewProps {
    data: LocalFile | SdCardFile
}

function FileView({data}: FileViewProps){

    let Icon
    if ("prints" in data) {
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

interface FolderViewProps {
    data: Folder
}

function FolderView ({data}: FolderViewProps) {
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
