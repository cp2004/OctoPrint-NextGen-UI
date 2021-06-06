import { Button, ListItem } from '@material-ui/core';

const NavItem = ({href, icon: Icon, title, ...rest}) => {
    return (
        <ListItem
            disableGutters
            sx={{
                display: 'flex',
                py: 0
            }}
            {...rest}
        >
            <Button
                sx={{
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    justifyContent: 'flex-start',
                    letterSpacing: 0,
                    py: 1.25,
                    textTransform: 'none',
                    width: '100%',
                    '& svg': {
                        mr: 1
                    }
                }}
            >
                {Icon && (
                    <Icon size="20" />
                )}
                <span>
          {title}
        </span>
            </Button>
        </ListItem>
    );
};

export default NavItem;
