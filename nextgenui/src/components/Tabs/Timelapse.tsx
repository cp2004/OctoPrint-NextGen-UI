// @ts-nocheck
// The useSettings hook is not typescript-compatible yet
import * as React from "react"
import Typography from "@mui/material/Typography";
import {useSettings} from "../../providers/settings";
import {usePrinterStateStore} from "../../state/printerState";
import {
    Alert,
    AlertTitle,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
    Button,
    Box,
    TextField, Checkbox, FormControlLabel, Chip, Grid, Link, Dialog, DialogTitle, DialogContent,
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {useForm} from "react-hook-form"
import {useQuery} from "react-query";
import {
    bulkDownloadTimelapse,
    deleteTimelapse,
    get as timelapseGet,
    saveConfig,
    TimelapseList
} from "../../api/timelapse"
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridRowParams, GridSelectionModel,
    GridToolbarContainer, GridValueFormatterParams,
} from "@mui/x-data-grid";
import fileSize from "filesize";

export default function Timelapse ({isActive}) {
    const settings = useSettings()

    const isConfigured = settings.webcam.snapshotUrl && settings.webcam.ffmpegPath

    const printerState = usePrinterStateStore(state => state.flags)
    const {register, handleSubmit, watch, reset} = useForm()

    const onSubmit = data => {
        saveConfig({
            save: true,
            ...data
        })
    }

    const { data, isLoading, error, refetch } = useQuery<TimelapseList>("timelapse", () => timelapseGet(), {
        enabled: isActive
    })

    const watchTimelapseMode = watch("type")

    const configComponent = () => {
        if (isLoading || error || !data){
            return null
        }

        switch (watchTimelapseMode) {
            case "off":
                return (
                    <Typography sx={{my: 2}}>Timelapse is disabled.</Typography>
                )
            case "timed":
                return (
                    <TimedConfig register={register} data={data} />
                )
            case "zchange":
                return (
                    <ZChangeConfig register={register} data={data} />
                )
        }
    }

    const handleReset = () => {
        reset()
    }

    return (
        <>
            {isConfigured ? (
                <>
                    {printerState.printing && <Alert severity={"warning"}>Take note that timelapse configuration is disabled while printing</Alert>}
                    <Typography variant={"h6"}>
                        Timelapse Configuration
                    </Typography>
                    {!isLoading && !error && data &&
                        <Grid component={"form"} container spacing={2} sx={{"&> * > .MuiFormControl-root, .MuiButton-root": {my: 2}}} onSubmit={handleSubmit(onSubmit)}>
                            <Grid item md={6} sm={12} >
                                <FormControl fullWidth>
                                    <InputLabel id={"timelapse-config-mode"}>Mode</InputLabel>
                                    <Select labelId={"timelapse-config-mode"} label={"Mode"} defaultValue={data.config.type} {...register("type")}>
                                        <MenuItem value="off">Off</MenuItem>
                                        <MenuItem value="timed">Timed</MenuItem>
                                        <MenuItem value="zchange">On Z Change</MenuItem>
                                    </Select>
                                </FormControl>
                        {configComponent()}
                            </Grid>
                        <Grid item md={6} sm={12}>
                            {watchTimelapseMode !== "off" && <GenericConfig register={register} data={data} />}
                        </Grid>
                            <Grid item xs={12} sx={{textAlign: 'center'}}>
                                <Button sx={{mt: 2, mr: 1}} type={"submit"} variant={"outlined"}>Save Changes</Button>
                                <Button sx={{mt: 2, ml: 1}} variant={"outlined"} color={"secondary"} onClick={handleReset}>Reset Changes</Button>
                            </Grid>
                        </Grid>
                    }
                    </>
                ) : <WebcamNotConfigured />}
            <TimelapseListTable data={data ? data.files : []} loading={isLoading} onDelete={() => refetch()}/>
        </>
    )
}

function ZChangeConfig ({register, data}) {
    return (
        <>
            <Typography variant={"body2"}>
                <Chip color={"primary"} label={"Note:"} size={"small"} component={"span"} />
                {" Does not work when printing from the printer's SD Card (no way to detect the change in Z reliably)." +
                "Use \"Timed\" mode for those prints instead."}
            </Typography>
            <TextField
                type={"number"}
                fullWidth
                label={"Minimum Interval"}
                InputProps={{endAdornment: "sec"}}
                defaultValue={data.config.minDelay || 5}
                {...register("minDelay")}
                />
            <Typography variant={"body2"}>
                OctoPrint will rate limit snapshots to this minimum interval. This it to prevent against
                performance issues with vase mode/continuous z prints.
            </Typography>
            <TextField
                type={"number"}
                fullWidth
                label={"Retraction Z-Hop"}
                InputProps={{endAdornment: "mm"}}
                defaultValue={data.config.retractionZHop || 0}
                {...register("retractionZHop")}
                />
            <Typography variant={"body2"}>
                Enter the retraction z-hop used in the firmware or the gcode file to trigger snapshots for the
                timelapse only if a real layer change happens. For this to work properly your retraction z-hop
                has to be different from your layer height!
            </Typography>
        </>
    )
}

function TimedConfig ({register, data}) {
    return (
        <>
            <TextField
                type={"number"}
                fullWidth
                label={"Snapshot interval"}
                InputProps={{endAdornment: "sec"}}
                defaultValue={data.config.interval || 10}
                {...register("interval")}
            />
        </>
    )
}

function GenericConfig ({register, data}) {
    return (
        <>
            <TextField
                type={"number"}
                fullWidth
                label={"Timelapse frame rate"}
                InputProps={{endAdornment: "fps"}}
                defaultValue={data.config.fps || 25}
                {...register("fps")}
            />
            <TextField
                type={"number"}
                fullWidth
                label={"Timelapse post roll"}
                InputProps={{endAdornment: "sec"}}
                defaultValue={data.config.postRoll || 0}
                {...register("postRoll")}
            />
            <Typography variant={"body2"}>
                OctoPrint will use the final picture to add this many seconds to the end of your rendered timelapse.
            </Typography>
            <FormControl fullWidth>
                <FormControlLabel control={<Checkbox {...register("save")} />} label={"Save as default"} />
            </FormControl>
            <Typography variant={"body2"}>
                Check this to make your selected timelapse mode and options persist across restarts.
            </Typography>
        </>
    )
}

function WebcamNotConfigured () {
    const settings = useSettings()

    return (
        <Alert severity={"warning"}>
            <AlertTitle>Timelapse not fully configured</AlertTitle>
            <Typography variant={"body2"}>
                {'The snapshot URL and/or the path to FFMPEG are missing. You can change both under "Settings" > ' +
                '"Webcam & Timelapse" > "Timelapse". If you don\'t have a webcam or don\'t want to enable timelapse' +
                ' support you can also just disable it there.'}
            </Typography>
            <Typography variant={"body2"}>
                <strong>Currently configured snapshot URL:</strong> <code>{settings.webcam.snapshotUrl}</code><br />
                <strong>Currently configured path to FFMPEG:</strong> <code>{settings.webcam.ffmpegPath}</code>
            </Typography>
        </Alert>
    )
}




function TimelapseListTable ({data, loading, onDelete}) {
    const formattedData = React.useMemo(
        () => data.map((item, index) => ({id: index, ...item})),
        [data]

    )

    const [previewUrl, setPreviewUrl] = React.useState("")
    const [previewOpen, setPreviewOpen] = React.useState(false)

    const handleDelete = React.useCallback((filename: string) => {
        deleteTimelapse(filename)
        onDelete(filename)
    }, [onDelete])

    const handlePreview = React.useCallback((url: string) => {
        setPreviewUrl(url)
        setPreviewOpen(true)
    }, [])

    const gridCols: GridColDef = React.useMemo(() => ([
        {field: "name", headerName: "Name", flex: 0.4, editable: false},
        {field: "bytes", headerName: "Size", flex: 0.2, editable: false,
            valueFormatter: (params: GridValueFormatterParams) => fileSize(params.value)
        },
        {field: "date", headerName: "Date", flex: 0.2, editable: false},
        {field: "actions", type: "actions", flex: 0.2, headerName: "Actions", editable: false,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<DownloadIcon />}
                    label={"Download"}
                    component={Link}
                    href={params.row.url}
                />,
                <GridActionsCellItem
                    label={"Delete"}
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(params.getValue(params.id, "name"))}
                />,
                <GridActionsCellItem
                    label={"Play"}
                    icon={<PlayCircleOutlineIcon />}
                    onClick={() => handlePreview(params.row.url)}
                    disabled={params.row.url.toLowerCase().indexOf(".mp4") === -1}
                />,
            ]
        }
    ]), [handleDelete, handlePreview])

    const [selectedRows, setSelectedRows] = React.useState<GridSelectionModel>([])

    const handleMultipleDelete = () => {
        // TODO : show confirmation dialog
        // TODO : show progress dialog
        const selectedTimelapses = selectedRows.map((row) => formattedData[row].name)
        selectedTimelapses.forEach((timelapse) => deleteTimelapse(timelapse))
        onDelete()
        setSelectedRows([])
    }

    const GridToolbar = () => (
        <GridToolbarContainer>
            <Button
                variant={"outlined"}
                color={"primary"}
                startIcon={<DownloadIcon />}
                sx={{mr: 1}}
                component={Link}
                href={selectedRows.length ? bulkDownloadTimelapse(selectedRows.map((row) => formattedData[row].name)) : ""}
                disabled={selectedRows.length === 0}
            >
                Download Selected
            </Button>
            <Button
                variant={"outlined"}
                color={"error"}
                startIcon={<DeleteIcon />}
                onClick={handleMultipleDelete}
                disabled={selectedRows.length === 0}
            >
                Delete Selected
            </Button>
        </GridToolbarContainer>
    )

    return (
        <>
            <Box display={"flex"} minHeight={"400px"}>
                <DataGrid
                    loading={loading}
                    autoHeight
                    columns={gridCols}
                    rows={formattedData}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    checkboxSelection
                    disableSelectionOnClick
                    disableColumnMenu
                    selectionModel={selectedRows}
                    onSelectionModelChange={setSelectedRows}
                />
            </Box>
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
                <DialogTitle>Timelapse Preview</DialogTitle>
                <DialogContent>
                    <video autoPlay controls src={previewUrl} width={"100%"} />
                </DialogContent>
            </Dialog>
        </>
    )
}
