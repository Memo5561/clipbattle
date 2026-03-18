import {createNavigation} from "next-intl/navigation";

export const {Link, useRouter, usePathname} = createNavigation({
  locales: ["de", "en", "tr"]
});