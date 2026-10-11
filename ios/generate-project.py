"""Deterministic Xcode project; no CocoaPods, XcodeGen, or third-party SDKs."""
import hashlib
import json
import pathlib
import plistlib
import sys

root = pathlib.Path(__file__).resolve().parent
objects = {}

def ref(name):
    return hashlib.sha1(('slat-ios-v1:' + name).encode()).hexdigest()[:24].upper()

def add(key, isa, **fields):
    objects[ref(key)] = {'isa': isa, **fields}
    return ref(key)

def text(value, depth=0):
    if isinstance(value, dict):
        return '{\n' + ''.join('\t' * (depth + 1) + json.dumps(str(k)) + ' = ' + text(v, depth + 1) + ';\n' for k, v in value.items()) + '\t' * depth + '}'
    if isinstance(value, list):
        return '(' + ', '.join(text(v, depth) for v in value) + ')'
    return str(value) if isinstance(value, int) else json.dumps(value)

app_sources = ['SlatApp.swift', 'SlatWebView.swift', 'RestActivityController.swift']
shared_sources = ['RestActivityAttributes.swift']
widget_sources = ['SlatRestWidget.swift']
groups = []
files = {}
for directory, names in [('App', app_sources + ['Info.plist', 'Assets.xcassets']), ('Shared', shared_sources), ('Widget', widget_sources + ['Info.plist'])]:
    children = []
    for name in names:
        path = directory + '/' + name
        kind = 'sourcecode.swift' if name.endswith('.swift') else 'folder.assetcatalog' if name.endswith('.xcassets') else 'text.plist.xml'
        files[path] = add('file:' + path, 'PBXFileReference', lastKnownFileType=kind, path=name, sourceTree='<group>')
        children.append(files[path])
    groups.append(add('group:' + directory, 'PBXGroup', children=children, path=directory, sourceTree='<group>'))

app_product = add('product:app', 'PBXFileReference', explicitFileType='wrapper.application', path='Slat.app', sourceTree='BUILT_PRODUCTS_DIR')
widget_product = add('product:widget', 'PBXFileReference', explicitFileType='wrapper.app-extension', path='SlatRestWidget.appex', sourceTree='BUILT_PRODUCTS_DIR')
products = add('products', 'PBXGroup', children=[app_product, widget_product], name='Products', sourceTree='<group>')
main_group = add('main', 'PBXGroup', children=groups + [products], sourceTree='<group>')

def phase(name, paths, kind):
    build_files = [add('build:' + name + ':' + p, 'PBXBuildFile', fileRef=files[p]) for p in paths]
    return add('phase:' + name, kind, buildActionMask=2147483647, files=build_files, runOnlyForDeploymentPostprocessing=0)

app_phase = phase('app-sources', ['App/' + p for p in app_sources] + ['Shared/' + p for p in shared_sources], 'PBXSourcesBuildPhase')
widget_phase = phase('widget-sources', ['Widget/' + p for p in widget_sources] + ['Shared/' + p for p in shared_sources], 'PBXSourcesBuildPhase')
resources = phase('app-resources', ['App/Assets.xcassets'], 'PBXResourcesBuildPhase')
app_frameworks = phase('app-frameworks', [], 'PBXFrameworksBuildPhase')
widget_frameworks = phase('widget-frameworks', [], 'PBXFrameworksBuildPhase')
embed_file = add('embed-widget-file', 'PBXBuildFile', fileRef=widget_product, settings={'ATTRIBUTES': ['CodeSignOnCopy', 'RemoveHeadersOnCopy']})
embed = add('embed-widget', 'PBXCopyFilesBuildPhase', buildActionMask=2147483647, dstPath='', dstSubfolderSpec=13, files=[embed_file], name='Embed App Extensions', runOnlyForDeploymentPostprocessing=0)

def configs(name, settings):
    ids = []
    for configuration in ['Debug', 'Release']:
        values = dict(settings)
        values.update({'SWIFT_OPTIMIZATION_LEVEL': '-Onone' if configuration == 'Debug' else '-O', 'SWIFT_ACTIVE_COMPILATION_CONDITIONS': 'DEBUG' if configuration == 'Debug' else ''})
        ids.append(add('config:' + name + ':' + configuration, 'XCBuildConfiguration', buildSettings=values, name=configuration))
    return add('configs:' + name, 'XCConfigurationList', buildConfigurations=ids, defaultConfigurationIsVisible=0, defaultConfigurationName='Release')

common = {'SDKROOT': 'iphoneos', 'IPHONEOS_DEPLOYMENT_TARGET': '17.0', 'SWIFT_VERSION': '5.0', 'CLANG_ENABLE_MODULES': 'YES', 'CODE_SIGN_STYLE': 'Automatic', 'TARGETED_DEVICE_FAMILY': '1', 'SUPPORTED_PLATFORMS': 'iphoneos iphonesimulator', 'MARKETING_VERSION': '5.7.4', 'CURRENT_PROJECT_VERSION': '574', 'GENERATE_INFOPLIST_FILE': 'NO'}
project_configs = configs('project', {'CLANG_ENABLE_MODULES': 'YES', 'SWIFT_VERSION': '5.0', 'IPHONEOS_DEPLOYMENT_TARGET': '17.0'})
app_configs = configs('app', {**common, 'PRODUCT_BUNDLE_IDENTIFIER': 'io.github.zerryh.slat', 'PRODUCT_NAME': 'Slat', 'INFOPLIST_FILE': 'App/Info.plist', 'ASSETCATALOG_COMPILER_APPICON_NAME': 'AppIcon', 'LD_RUNPATH_SEARCH_PATHS': ['$(inherited)', '@executable_path/Frameworks']})
widget_configs = configs('widget', {**common, 'PRODUCT_BUNDLE_IDENTIFIER': 'io.github.zerryh.slat.RestLiveActivity', 'PRODUCT_NAME': 'SlatRestWidget', 'INFOPLIST_FILE': 'Widget/Info.plist', 'APPLICATION_EXTENSION_API_ONLY': 'YES', 'SKIP_INSTALL': 'YES', 'LD_RUNPATH_SEARCH_PATHS': ['$(inherited)', '@executable_path/../../Frameworks', '@executable_path/Frameworks']})
widget_target = add('target:widget', 'PBXNativeTarget', buildConfigurationList=widget_configs, buildPhases=[widget_phase, widget_frameworks], buildRules=[], dependencies=[], name='SlatRestWidget', productName='SlatRestWidget', productReference=widget_product, productType='com.apple.product-type.app-extension')
proxy = add('widget-proxy', 'PBXContainerItemProxy', containerPortal=ref('project'), proxyType=1, remoteGlobalIDString=widget_target, remoteInfo='SlatRestWidget')
dependency = add('widget-dependency', 'PBXTargetDependency', target=widget_target, targetProxy=proxy)
app_target = add('target:app', 'PBXNativeTarget', buildConfigurationList=app_configs, buildPhases=[app_phase, app_frameworks, resources, embed], buildRules=[], dependencies=[dependency], name='Slat', productName='Slat', productReference=app_product, productType='com.apple.product-type.application')
project = add('project', 'PBXProject', attributes={'LastUpgradeCheck': '2600', 'TargetAttributes': {app_target: {'CreatedOnToolsVersion': '26.0'}, widget_target: {'CreatedOnToolsVersion': '26.0'}}}, buildConfigurationList=project_configs, compatibilityVersion='Xcode 14.0', developmentRegion='en', hasScannedForEncodings=0, knownRegions=['en', 'Base'], mainGroup=main_group, productRefGroup=products, projectDirPath='', projectRoot='', targets=[app_target, widget_target])
pbx = '// !$*UTF8*$!\n' + text({'archiveVersion': 1, 'classes': {}, 'objectVersion': 56, 'objects': objects, 'rootObject': project}) + '\n'

scheme = f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
 <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{app_target}" BuildableName="Slat.app" BlueprintName="Slat" ReferencedContainer="container:Slat.xcodeproj"/></BuildActionEntry></BuildActionEntries></BuildAction>
 <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"/>
 <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{app_target}" BuildableName="Slat.app" BlueprintName="Slat" ReferencedContainer="container:Slat.xcodeproj"/></BuildableProductRunnable></LaunchAction>
 <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{app_target}" BuildableName="Slat.app" BlueprintName="Slat" ReferencedContainer="container:Slat.xcodeproj"/></BuildableProductRunnable></ProfileAction>
 <AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
'''
base_plist = {'CFBundleDevelopmentRegion': 'en', 'CFBundleExecutable': '$(EXECUTABLE_NAME)', 'CFBundleIdentifier': '$(PRODUCT_BUNDLE_IDENTIFIER)', 'CFBundleInfoDictionaryVersion': '6.0', 'CFBundleName': '$(PRODUCT_NAME)', 'CFBundleShortVersionString': '$(MARKETING_VERSION)', 'CFBundleVersion': '$(CURRENT_PROJECT_VERSION)'}
app_plist = {**base_plist, 'CFBundleDisplayName': 'Slat', 'CFBundlePackageType': 'APPL', 'NSSupportsLiveActivities': True, 'UILaunchScreen': {}, 'UIRequiresFullScreen': True, 'UISupportedInterfaceOrientations': ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight'], 'CFBundleURLTypes': [{'CFBundleURLName': 'io.github.zerryh.slat.rest', 'CFBundleURLSchemes': ['slat']}]}
widget_plist = {**base_plist, 'CFBundleDisplayName': 'Slat Rest', 'CFBundlePackageType': 'XPC!', 'NSExtension': {'NSExtensionPointIdentifier': 'com.apple.widgetkit-extension'}}
outputs = {'Slat.xcodeproj/project.pbxproj': pbx.encode(), 'Slat.xcodeproj/xcshareddata/xcschemes/Slat.xcscheme': scheme.encode(), 'App/Info.plist': plistlib.dumps(app_plist, sort_keys=False), 'Widget/Info.plist': plistlib.dumps(widget_plist, sort_keys=False)}
for path, value in outputs.items():
    target = root / path
    if '--check' in sys.argv:
        if not target.exists() or target.read_bytes() != value:
            raise SystemExit('Stale generated iOS project: ' + path)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(value)
print('iOS project is reproducible' if '--check' in sys.argv else 'iOS project generated')
