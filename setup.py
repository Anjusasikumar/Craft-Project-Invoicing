from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in craft_project_invoicing/__init__.py
from craft_project_invoicing import __version__ as version

setup(
	name="craft_project_invoicing",
	version=version,
	description="craft_project_invoicing",
	author="craftinteractive.ae",
	author_email="craftinteractive.ae",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
