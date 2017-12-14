import DatastoreMixin from 'maxfactor-vue-datastore'
import { UserData } from '../Schema'

export default {
    mixins: [
        DatastoreMixin,
    ],

    data() {
        return {
            account: {
                loggedIn: false,
                userData: UserData,
            },
        }
    },

    /**
     * Load the account data using the Datastore
     */
    mounted() {
        this.loadData('account')
    },
}
