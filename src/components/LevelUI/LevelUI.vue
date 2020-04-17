<template>
	<div class="level-ui-template">
		<el-container>
			<el-header>
				<el-button
					class="primary"
					@click="chooseDBPath"
				>Choose</el-button>
			</el-header>
			<el-container>
				<el-aside width="200px">
					<el-radio-group
						v-model="isCollapse"
						style="margin-bottom: 20px;"
					>
						<el-radio-button :label="false">展开</el-radio-button>
						<el-radio-button :label="true">收起</el-radio-button>
					</el-radio-group>
					<el-menu
						default-active="1-4-1"
						class="el-menu-vertical-demo"
						@open="handleOpen"
						@close="handleClose"
						@select="showDB"
						:collapse="isCollapse"
					>
						<el-menu-item
							v-for="(baseDB,index) in baseDBLists"
							:key="index"
							:index="index.toString()"
						>
							<i class="el-icon-menu"></i>
							<span slot="title">{{baseDB.dbName}}</span>
						</el-menu-item>
					</el-menu>
				</el-aside>
				<el-main>
					<el-container>
						<el-aside width="200px">
							<div v-if="baseDBDisplayedKey.length >0">
								<p
									v-for="(key,index) in baseDBDisplayedKey"
									:key="index"
									@click="setBaseDBDisplayedValue(key)"
								>{{key}}</p>
							</div>
						</el-aside>
						<el-main>{{baseDBDisplayedValue}}</el-main>
					</el-container>

				</el-main>
			</el-container>
		</el-container>
	</div>
</template>
<script>
const { dialog } = require("electron").remote;
const BaseDB = require("./baseDB").default;
export default {
	mounted() {},
	data() {
		return {
			isCollapse: false,
			baseDBLists: [],
			baseDBDisplayedIndex: null,
			baseDBDisplayedKey: [],
			baseDBDisplayedValue: null,
			baseDBDisplayed: {}
		};
	},
	watch: {
		async baseDBDisplayedIndex() {
			const baseDB = this.baseDBLists[this.baseDBDisplayedIndex];
			if (!baseDB.db) {
				try {
					await baseDB.startDB();
				} catch (error) {
					this.$message.error(error.toString());
				}
			}
			this.baseDBDisplayed = await this.baseDBLists[
				this.baseDBDisplayedIndex
			].getAllData();
			this.baseDBDisplayedKey = Object.keys(this.baseDBDisplayed);
		}
	},
	methods: {
		handleOpen(key, keyPath) {
			console.log(key, keyPath);
		},
		handleClose(key, keyPath) {
			console.log(key, keyPath);
		},
		showDB(index) {
			if (index !== this.baseDBDisplayedIndex) {
				this.baseDBDisplayedIndex = index;
			}
		},
		setBaseDBDisplayedValue(key) {
			this.baseDBDisplayedValue = this.baseDBDisplayed[key];
		},
		chooseDBPath() {
			dialog.showOpenDialog(
				{
					properties: ["openDirectory"]
				},
				async dir => {
					if (dir) {
						const baseDB = new BaseDB(dir[0]);
						this.baseDBLists.push(baseDB);
						try {
							// this.dbData = await baseDB.getAllData();
						} catch (error) {
							this.$message.error(error.toString());
						}
					}
				}
			);
		}
	}
};
</script>
