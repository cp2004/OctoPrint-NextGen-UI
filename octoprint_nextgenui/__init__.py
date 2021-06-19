import os
import hashlib

from flask import Response

import octoprint.plugin
from octoprint.util import to_bytes

PATH_TO_INDEX = os.path.join(os.path.dirname(__file__), "static", "index.html")
print(PATH_TO_INDEX)

SUPPORTED_COMPONENT_TYPES = ["settings"]


class NextGenUIPlugin(octoprint.plugin.SettingsPlugin,
                      octoprint.plugin.AssetPlugin,
                      octoprint.plugin.TemplatePlugin,
                      octoprint.plugin.UiPlugin):
    # TODO
    # Could heavily cache this view, and have it return 304 not modified if
    # (a) the plugin version has not changed, and (b) caching is not disabled
    # Since we are using static content, we have no need for dynamic rendering at runtime
    # and can just serve the same file over and over.

    plugin_components = {}
    # Data structure here:
    # plugin_components = {
    #     'settings': [{
    #         'plugin': 'plugin_id',
    #         'component_path': './plugin/plugin_id/static/SomeComponent.js'
    #     }]
    # }

    def will_handle_ui(self, request):
        # Only handle UI if asked to, TODO could be a setting 'use as default'
        if "nextgen" in request.args:
            return True

    def get_ui_custom_tracked_files(self):
        # No idea what this does
        return ["index.html"]

    def get_ui_permissions(self):
        return []

    def on_ui_render(self, now, request, render_kwargs):
        # This seems like a hack to render a static file at the server root
        # Could put it in templates, but that causes more issues with copying the output

        with open(PATH_TO_INDEX, "rt") as index:
            content = index.read()
        return Response(content, mimetype="text/html")

    # Plugin support (or at least, an attempt :P)
    def register_component(self, plugin_id, component_type, component_filename):
        path = f"./plugin/{plugin_id}/static/{component_filename}"

        if component_type not in SUPPORTED_COMPONENT_TYPES:
            raise InvalidTemplateError("Component type is not supported")

        if component_type not in self.plugin_components:
            self.plugin_components[component_type] = []

        self.plugin_components[component_type].append({
            'plugin': plugin_id,
            'component_path': path
        })

    # Software Update hook
    def get_update_information(self):
        return dict(
            nextgenui=dict(
                displayName="NextGenUI",
                displayVersion=self._plugin_version,

                # version check: github repository
                type="github_release",
                user="cp2004",
                repo="OctoPrint-NextGen-UI",
                current=self._plugin_version,

                # update method: pip
                pip="https://github.com/cp2004/OctoPrint-NextGen-UI/archive/{target_version}.zip"
            )
        )


class InvalidTemplateError(Exception):
    pass


__plugin_name__ = "NextGenUI"
__plugin_pythoncompat__ = ">=3.7,<4"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = NextGenUIPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }

    global __plugin_helpers__
    __plugin_helpers__ = {
        "register_component": __plugin_implementation__.register_component
    }
